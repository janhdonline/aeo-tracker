import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    
    // Use Web Crypto API (compatible with Cloudflare Workers)
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
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (digest !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const eventName = data.meta?.event_name;

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const customerId = data.data?.attributes?.customer_id;
      const status = data.data?.attributes?.status;
      const variantId = data.data?.attributes?.variant_id;
      const userEmail = data.data?.attributes?.user_email;

      let plan = 'free';
      let keywordsLimit = 10;
      let engines = ['gemini'];
      let frequency = 'monthly';

      if (variantId === process.env.LEMONSQUEEZY_STARTER_VARIANT_ID) {
        plan = 'starter';
        keywordsLimit = 50;
        engines = ['gemini', 'perplexity', 'openai'];
        frequency = 'weekly';
      } else if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) {
        plan = 'pro';
        keywordsLimit = 150;
        engines = ['gemini', 'perplexity', 'openai', 'grok'];
        frequency = 'weekly';
      }

      const adminClient = createAdminClient();

      // Match user by email (Lemon Squeezy provides user_email)
      const { data: profile, error: findError } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      if (findError) {
        console.error('Webhook profile lookup error:', findError.message, findError.details);
        return NextResponse.json({ error: 'DB lookup failed' }, { status: 500 });
      }

      if (!profile) {
        console.warn('Webhook: no profile found for email', userEmail);
        return NextResponse.json({ received: true });
      }

      const { error, count } = await adminClient
        .from('profiles')
        .update({
          plan,
          lemonsqueezy_customer_id: customerId?.toString(),
          plan_keywords_limit: keywordsLimit,
          plan_engines: engines,
          plan_run_frequency: frequency,
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Webhook DB update error:', error.message, error.details);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }
      if (!count) {
        console.warn('Webhook: update affected 0 rows for', profile.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}