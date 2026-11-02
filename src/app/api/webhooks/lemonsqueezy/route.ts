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
      await adminClient
        .from('profiles')
        .update({
          plan,
          lemonsqueezy_customer_id: customerId?.toString(),
          plan_keywords_limit: keywordsLimit,
          plan_engines: engines,
          plan_run_frequency: frequency,
        })
        .eq('lemonsqueezy_customer_id', customerId?.toString());
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}