import { getConfig } from '@/lib/config';

interface ImpersonationPayload {
  userId: string;
  email: string;
  expiresAt: number;
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createImpersonationToken(
  userId: string,
  email: string
): Promise<string> {
  const masterPassword = (await getConfig('admin_master_password')) || 'Admin@2026!';
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour validity
  const payload: ImpersonationPayload = { userId, email, expiresAt };
  const rawPayload = JSON.stringify(payload);
  const base64Payload = Buffer.from(rawPayload, 'utf8').toString('base64');
  const signature = await hmacSha256(masterPassword, base64Payload);
  return `${base64Payload}.${signature}`;
}

export async function verifyImpersonationToken(
  token: string
): Promise<{ valid: boolean; userId?: string; email?: string }> {
  try {
    if (!token || !token.includes('.')) return { valid: false };
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return { valid: false };

    const masterPassword = (await getConfig('admin_master_password')) || 'Admin@2026!';
    const expectedSignature = await hmacSha256(masterPassword, base64Payload);

    if (signature !== expectedSignature) {
      return { valid: false };
    }

    const jsonStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const payload: ImpersonationPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.expiresAt) {
      return { valid: false }; // Expired
    }

    return { valid: true, userId: payload.userId, email: payload.email };
  } catch (err) {
    return { valid: false };
  }
}
