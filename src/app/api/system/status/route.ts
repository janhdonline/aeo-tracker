import { NextResponse } from 'next/server';
import { getConfig, getConfigBoolean } from '@/lib/config';

let cachedStatus: {
  data: {
    maintenance: boolean;
    maintenanceMessage: string;
    banner: {
      active: boolean;
      text: string;
      type: 'info' | 'warning' | 'alert';
      link?: string;
    };
  };
  lastFetch: number;
} | null = null;

const CACHE_TTL_MS = 15_000; // 15 seconds

export async function GET() {
  const now = Date.now();
  if (cachedStatus && now - cachedStatus.lastFetch < CACHE_TTL_MS) {
    return NextResponse.json(cachedStatus.data);
  }

  try {
    const [maintenance, maintenanceMessage, bannerRaw] = await Promise.all([
      getConfigBoolean('maintenance_mode', false),
      getConfig('maintenance_message'),
      getConfig('announcement_banner'),
    ]);

    let banner = {
      active: false,
      text: '',
      type: 'info' as const,
      link: '',
    };

    if (bannerRaw) {
      try {
        const parsed = JSON.parse(bannerRaw);
        banner = {
          active: Boolean(parsed.active),
          text: String(parsed.text || ''),
          type: ['info', 'warning', 'alert'].includes(parsed.type) ? parsed.type : 'info',
          link: parsed.link || '',
        };
      } catch {
        // Fallback banner
      }
    }

    const result = {
      maintenance,
      maintenanceMessage:
        maintenanceMessage ||
        'We are undergoing scheduled infrastructure maintenance. Services will resume shortly.',
      banner,
    };

    cachedStatus = { data: result, lastFetch: now };
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        maintenance: false,
        maintenanceMessage: '',
        banner: { active: false, text: '', type: 'info' },
      },
      { status: 200 }
    );
  }
}
