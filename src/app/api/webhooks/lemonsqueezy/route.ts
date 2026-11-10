import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPaymentConfig } from '@/lib/config';
import { getEnv } from '@/lib/env';
import { sendNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  const admin = createAdminClient();
  let rawBody = '';

  try {
    rawBody = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const secret =
      (await getPaymentConfig('ls_webhook_secret')) ||
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
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const digest = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (digest !== signature) {
      // Log invalid webhook attempt
      await admin.from('webhook_events').insert({
        source: 'lemonsqueezy',
        event_name: 'unknown_signature_failed',
        payload: { raw: rawBody.slice(0, 500) },
        signature_valid: false,
        processed: false,
        error: 'Invalid signature',
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(rawBody);
    const eventName = data.meta?.event_name || 'unknown';

    console.log('LemonSqueezy event received:', eventName);

    // Record webhook event in DB
    const { data: loggedEvent } = await admin
      .from('webhook_events')
      .insert({
        source: 'lemonsqueezy',
        event_name: eventName,
        payload: data,
        signature_valid: true,
        processed: false,
      })
      .select('id')
      .single();

    const eventId = loggedEvent?.id;

    const attributes = data.data?.attributes ?? {};
    const customerId = attributes.customer_id;
    const subscriptionId = data.data?.id ? String(data.data.id) : undefined;
    const variantId = String(attributes.variant_id ?? attributes.first_subscription_item?.variant_id ?? '');
    const userEmail = attributes.user_email;

    const starterId = String(
      (await getPaymentConfig('ls_starter_variant_id')) ||
      getEnv('LEMONSQUEEZY_STARTER_VARIANT_ID') ||
      '2337849'
    );
    const proId = String(
      (await getPaymentConfig('ls_pro_variant_id')) ||
      getEnv('LEMONSQUEEZY_PRO_VARIANT_ID') ||
      '2337852'
    );

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      let plan = 'free';
      if (variantId === starterId) plan = 'starter';
      else if (variantId === proId) plan = 'pro';

      const { data: profile } = await admin
        .from('profiles')
        .select('id, email, plan')
        .eq('email', userEmail)
        .maybeSingle();

      if (profile) {
        const keywordsLimit = plan === 'pro' ? 150 : plan === 'starter' ? 50 : 10;
        const engines =
          plan === 'pro'
            ? ['gemini', 'perplexity', 'openai', 'grok']
            : plan === 'starter'
            ? ['gemini', 'perplexity', 'openai']
            : ['gemini'];
        const runFrequency = plan === 'free' ? 'monthly' : 'weekly';

        await admin
          .from('profiles')
          .update({
            plan,
            plan_keywords_limit: keywordsLimit,
            plan_engines: engines,
            plan_run_frequency: runFrequency,
            lemonsqueezy_customer_id: customerId?.toString(),
            lemonsqueezy_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_renews_at: attributes.renews_at || attributes.ends_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (eventId) {
          await admin.from('webhook_events').update({ processed: true }).eq('id', eventId);
        }

        // Notify user
        await sendNotification(
          'payment_success',
          profile.id,
          userEmail,
          `Your AEO Tracker subscription (${plan.toUpperCase()}) is active!`,
          `<p>Thank you for subscribing to the <strong>${plan.toUpperCase()}</strong> plan. Your quota has been updated.</p>`,
          { plan, variantId }
        );
      }
    } else if (eventName === 'subscription_cancelled') {
      const endsAt = attributes.ends_at || new Date(Date.now() + 30 * 86400000).toISOString();
      await admin
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_renews_at: endsAt,
          updated_at: new Date().toISOString(),
        })
        .or(`lemonsqueezy_subscription_id.eq.${subscriptionId},email.eq.${userEmail}`);

      if (eventId) {
        await admin.from('webhook_events').update({ processed: true }).eq('id', eventId);
      }
    } else if (eventName === 'subscription_payment_failed') {
      const gracePeriodEnd = new Date(Date.now() + 7 * 86400000).toISOString();
      const { data: prof } = await admin
        .from('profiles')
        .update({
          subscription_status: 'past_due',
          subscription_grace_until: gracePeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .or(`lemonsqueezy_subscription_id.eq.${subscriptionId},email.eq.${userEmail}`)
        .select('id')
        .maybeSingle();

      if (eventId) {
        await admin.from('webhook_events').update({ processed: true }).eq('id', eventId);
      }

      if (prof?.id) {
        await sendNotification(
          'payment_failed',
          prof.id,
          userEmail,
          'AEO Tracker Payment Failed — 7-Day Grace Period Active',
          `<p>We were unable to process your subscription renewal. You have a <strong>7-day grace period</strong> before your limits are reset. Please update your billing method.</p>`
        );
      }
    } else {
      // Other events marked processed
      if (eventId) {
        await admin.from('webhook_events').update({ processed: true }).eq('id', eventId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook unhandled error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
