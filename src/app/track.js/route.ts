import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const SCRIPT_CONTENT = `(function() {
  try {
    var script = document.currentScript || document.querySelector('script[data-project]');
    var projectId = script ? script.getAttribute('data-project') : null;
    var ref = document.referrer || '';
    var isAI = /chatgpt\\.com|chat\\.openai\\.com|perplexity\\.ai|pplx\\.ai|claude\\.ai|gemini\\.google\\.com|copilot\\.microsoft\\.com/i.test(ref);
    
    if (isAI && projectId) {
      var payload = JSON.stringify({
        projectId: projectId,
        referer: ref,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('https://aeo-tracker.janhdonline.workers.dev/api/tools/agent-analytics', payload);
      } else {
        fetch('https://aeo-tracker.janhdonline.workers.dev/api/tools/agent-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      }
    }
  } catch(e) {}
})();`;

export async function GET() {
  return new NextResponse(SCRIPT_CONTENT, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
