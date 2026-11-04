import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

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

    console.log('Payload attributes:', JSON.stringify(data?.data?.attributes ?? {}, null, 2));

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const customerId = data.data?.attributes?.customer_id;
      const attributes = data.data?.attributes ?? {};
      const variantId = attributes.variant_id ?? attributes.first_subscription_item?.variant_id;
      const userEmail = attributes.user_email;

      let plan = 'free';
      if (String(variantId) === process.env.LEMONSQUEEZY_STARTER_VARIANT_ID) plan = 'starter';
      else if (String(variantId) === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) plan = 'pro';

      console.log('Variant ID received:', variantId);
      console.log('Determined plan:', plan);

      console.log('Service Key exists?', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: profile, error: findError } = await supabase
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

      console.log('Upserting plan:', plan);

      const { data: updated, error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: profile.id,
            email: userEmail,
            plan,
            lemonsqueezy_customer_id: customerId?.toString(),
          },
          { onConflict: 'id' }
        )
        .select();

      console.log('DB Result:', { data: updated, error });

      if (error) {
        console.error('Webhook DB update error:', error.message, error.details);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      if (!updated || updated.length === 0) {
        console.warn('Webhook: upsert affected 0 rows for', profile.id);
        return NextResponse.json({ error: 'DB upsert returned no rows' }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}