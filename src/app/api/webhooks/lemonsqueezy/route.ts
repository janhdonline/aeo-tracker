import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const secret =
      getEnv('LEMONSQUEEZY_WEBHOOK_SECRET') ||
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET ||
      '';

    if (!secret) {
      console.warn('LEMONSQUEEZY_WEBHOOK_SECRET is not configured.');
      return NextResponse.json({ error: 'Webhook secret unconfigured' }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const digest = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (digest !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const eventName = data.meta?.event_name;

    console.log('LemonSqueezy event received:', eventName);

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const customerId = data.data?.attributes?.customer_id;
      const attributes = data.data?.attributes ?? {};
      const variantId = attributes.variant_id ?? attributes.first_subscription_item?.variant_id;
      const userEmail = attributes.user_email;

      const starterId =
        getEnv('LEMONSQUEEZY_STARTER_VARIANT_ID') ||
        process.env.LEMONSQUEEZY_STARTER_VARIANT_ID ||
        '2337849';
      const proId =
        getEnv('LEMONSQUEEZY_PRO_VARIANT_ID') ||
        process.env.LEMONSQUEEZY_PRO_VARIANT_ID ||
        '2337852';

      let plan = 'free';
      if (String(variantId) === String(starterId)) plan = 'starter';
      else if (String(variantId) === String(proId)) plan = 'pro';

      console.log('Variant ID received:', variantId, '-> Plan:', plan, 'for user:', userEmail);

      const supabaseUrl =
        getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        '';
      const serviceRoleKey =
        getEnv('SUPABASE_SERVICE_ROLE_KEY') ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        '';

      if (!supabaseUrl || !serviceRoleKey) {
        console.error('Supabase credentials missing in webhook handler.');
        return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, serviceRoleKey);

      const { data: profile, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      if (findError) {
        console.error('Webhook profile lookup error:', findError.message);
        return NextResponse.json({ error: 'DB lookup failed' }, { status: 500 });
      }

      if (!profile) {
        console.warn('Profile not found for email:', userEmail);
        return NextResponse.json({ message: 'Profile not found' }, { status: 200 });
      }

      const keywordsLimit = plan === 'pro' ? 150 : plan === 'starter' ? 50 : 10;
      const engines =
        plan === 'pro'
          ? ['gemini', 'perplexity', 'openai', 'grok']
          : plan === 'starter'
          ? ['gemini', 'perplexity']
          : ['gemini'];
      const runFrequency = plan === 'free' ? 'monthly' : 'weekly';

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          plan,
          plan_keywords_limit: keywordsLimit,
          plan_engines: engines,
          plan_run_frequency: runFrequency,
          lemonsqueezy_customer_id: customerId?.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Webhook profile update error:', updateError.message);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }

      console.log('Successfully upgraded user:', userEmail, 'to plan:', plan);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook unhandled error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
