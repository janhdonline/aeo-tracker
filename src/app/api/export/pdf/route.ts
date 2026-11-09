export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function escapePdfText(text: string): string {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

interface PdfData {
  domain: string;
  brandName: string;
  latestScore: any;
  scoreHistory: any[];
  briefs: any[];
}

function generateAeoPdf(data: PdfData): Buffer {
  const { domain, brandName, latestScore, scoreHistory, briefs } = data;
  const streamLines: string[] = [];

  const drawText = (
    text: string,
    x: number,
    y: number,
    size: number = 10,
    isBold: boolean = false,
    color: [number, number, number] = [0.1, 0.1, 0.15]
  ) => {
    const font = isBold ? '/F2' : '/F1';
    streamLines.push(
      `${color[0]} ${color[1]} ${color[2]} rg`,
      'BT',
      `${font} ${size} Tf`,
      `${x} ${y} Td`,
      `(${escapePdfText(text)}) Tj`,
      'ET'
    );
  };

  const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    fillColor: [number, number, number] | null = null,
    strokeColor: [number, number, number] | null = null
  ) => {
    if (fillColor) {
      streamLines.push(`${fillColor[0]} ${fillColor[1]} ${fillColor[2]} rg`);
    }
    if (strokeColor) {
      streamLines.push(`${strokeColor[0]} ${strokeColor[1]} ${strokeColor[2]} RG`);
    }
    streamLines.push(`${x} ${y} ${w} ${h} re`);
    if (fillColor && strokeColor) {
      streamLines.push('B');
    } else if (fillColor) {
      streamLines.push('f');
    } else if (strokeColor) {
      streamLines.push('S');
    }
  };

  // 1. Header Banner
  drawRect(40, 735, 515, 65, [0.08, 0.13, 0.24]);
  drawText('AEO VISIBILITY REPORT', 55, 772, 18, true, [1, 1, 1]);
  drawText(
    `Target Domain: ${domain}  |  Brand: ${brandName || 'N/A'}`,
    55,
    750,
    11,
    false,
    [0.82, 0.88, 0.98]
  );

  // 2. Metrics Summary Card
  drawRect(40, 630, 515, 88, [0.97, 0.98, 1.0], [0.85, 0.88, 0.95]);
  drawText('LATEST AEO BENCHMARK RESULTS', 55, 696, 11, true, [0.18, 0.3, 0.52]);

  const score = latestScore?.visibility_score !== undefined ? String(latestScore.visibility_score) : 'N/A';
  const sov = latestScore?.share_of_voice_pct !== undefined ? `${latestScore.share_of_voice_pct}%` : 'N/A';
  const mentions = latestScore?.total_mentions !== undefined ? String(latestScore.total_mentions) : '0';
  const compMentions = latestScore?.competitor_mentions !== undefined ? String(latestScore.competitor_mentions) : '0';
  const kwCovered = latestScore
    ? `${latestScore.keywords_covered ?? 0}/${latestScore.keywords_total ?? 0}`
    : 'N/A';
  const scanDate = latestScore?.snapshot_date || new Date().toISOString().split('T')[0];

  drawText(`AEO Score: ${score}/100`, 55, 668, 13, true, [0.1, 0.4, 0.85]);
  drawText(`Share of Voice: ${sov}`, 195, 668, 13, true, [0.12, 0.62, 0.32]);
  drawText(`Total Mentions: ${mentions}`, 345, 668, 11, false, [0.2, 0.2, 0.2]);
  drawText(`Competitor Mentions: ${compMentions}`, 345, 646, 11, false, [0.45, 0.45, 0.45]);

  drawText(`Keywords Covered: ${kwCovered}`, 55, 646, 10, false, [0.35, 0.35, 0.4]);
  drawText(`Scan Date: ${scanDate}`, 195, 646, 10, false, [0.35, 0.35, 0.4]);

  // 3. Scan History Table
  drawText('HISTORICAL BENCHMARK SNAPSHOTS', 40, 598, 12, true, [0.12, 0.15, 0.22]);
  drawRect(40, 568, 515, 22, [0.91, 0.93, 0.97]);
  drawText('Date', 50, 574, 9, true, [0.2, 0.25, 0.35]);
  drawText('Score', 145, 574, 9, true, [0.2, 0.25, 0.35]);
  drawText('Share of Voice', 215, 574, 9, true, [0.2, 0.25, 0.35]);
  drawText('Mentions', 315, 574, 9, true, [0.2, 0.25, 0.35]);
  drawText('Comp. Mentions', 395, 574, 9, true, [0.2, 0.25, 0.35]);
  drawText('Keywords', 485, 574, 9, true, [0.2, 0.25, 0.35]);

  let rowY = 550;
  const historyList = (scoreHistory || []).slice(0, 7);
  if (historyList.length === 0) {
    drawText('No previous benchmark snapshots recorded yet.', 50, rowY, 9, false, [0.5, 0.5, 0.5]);
    rowY -= 18;
  } else {
    for (const item of historyList) {
      drawText(String(item.snapshot_date || 'N/A'), 50, rowY, 9, false);
      drawText(String(item.visibility_score ?? '0'), 145, rowY, 9, false);
      drawText(`${item.share_of_voice_pct ?? 0}%`, 215, rowY, 9, false);
      drawText(String(item.total_mentions ?? 0), 315, rowY, 9, false);
      drawText(String(item.competitor_mentions ?? 0), 395, rowY, 9, false);
      drawText(`${item.keywords_covered ?? 0}/${item.keywords_total ?? 0}`, 485, rowY, 9, false);
      drawRect(40, rowY - 4, 515, 0.5, null, [0.88, 0.88, 0.88]);
      rowY -= 18;
    }
  }

  // 4. Actionable Fix Briefs
  rowY -= 14;
  drawText('TOP ACTIONABLE FIX BRIEFS', 40, rowY, 12, true, [0.12, 0.15, 0.22]);
  rowY -= 18;

  const briefList = (briefs || []).slice(0, 5);
  if (briefList.length === 0) {
    drawRect(40, rowY - 26, 515, 34, [0.98, 0.99, 1.0], [0.9, 0.92, 0.96]);
    drawText('• Optimization Complete', 50, rowY - 8, 10, true, [0.15, 0.55, 0.25]);
    drawText('No critical visibility gaps detected. Run automated scans to discover new prompts.', 50, rowY - 21, 9, false, [0.4, 0.4, 0.4]);
  } else {
    for (const brief of briefList) {
      drawRect(40, rowY - 26, 515, 34, [0.99, 0.98, 0.96], [0.94, 0.9, 0.82]);
      drawText(`• ${brief.gap_type || 'AEO Visibility Gap'}`, 50, rowY - 8, 10, true, [0.75, 0.22, 0.12]);
      const desc = (brief.gap_description || 'Address model training mentions to boost brand visibility.').slice(0, 95);
      drawText(desc, 50, rowY - 21, 8.5, false, [0.35, 0.35, 0.35]);
      rowY -= 38;
    }
  }

  // Footer
  drawRect(40, 45, 515, 0.5, null, [0.82, 0.82, 0.82]);
  drawText(
    'Generated by AEO Visibility Platform • https://aeo-tracker.janhdonline.workers.dev',
    40,
    32,
    8,
    false,
    [0.45, 0.45, 0.45]
  );
  drawText('Page 1 of 1', 505, 32, 8, false, [0.45, 0.45, 0.45]);

  const streamContent = streamLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent);

  const pdfParts = [
    '%PDF-1.4\n',
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let offset = 0;
  const offsets: number[] = [];
  for (const part of pdfParts) {
    offsets.push(offset);
    offset += Buffer.byteLength(part);
  }

  const xrefStart = offset;
  let xref = 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 1; i <= 6; i++) {
    const o = offsets[i].toString().padStart(10, '0');
    xref += `${o} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdfParts.join('') + xref + trailer);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let projectId = searchParams.get('projectId');

    // Auto-resolve to user's latest project if not provided
    if (!projectId) {
      const { data: latestProjects } = await supabase
        .from('projects')
        .select('id, domain, brand_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (latestProjects && latestProjects.length > 0) {
        projectId = latestProjects[0].id;
      }
    }

    // If still no project, generate a clean sample AEO report
    if (!projectId) {
      const samplePdf = generateAeoPdf({
        domain: 'example.com',
        brandName: 'Demo Brand',
        latestScore: {
          visibility_score: 75,
          share_of_voice_pct: 35,
          total_mentions: 10,
          competitor_mentions: 15,
          keywords_covered: 5,
          keywords_total: 10,
          snapshot_date: new Date().toISOString().split('T')[0],
        },
        scoreHistory: [],
        briefs: [
          {
            gap_type: 'Sample AEO Brief',
            gap_description: 'Add your first project in the dashboard to generate live AI visibility reports.',
          },
        ],
      });

      return new NextResponse(new Uint8Array(samplePdf), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="aeo-sample-report.pdf"',
          'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        },
      });
    }

    // Verify project belongs to user
    const { data: project } = await supabase
      .from('projects')
      .select('id, domain, brand_name')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get snapshot scores
    const { data: scores } = await supabase
      .from('snapshot_scores')
      .select('*')
      .eq('project_id', projectId)
      .order('snapshot_date', { ascending: true });

    // Get fix briefs
    const { data: briefs } = await supabase
      .from('fix_briefs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10);

    const latestScore = scores && scores.length > 0 ? scores[scores.length - 1] : null;

    const pdfBuffer = generateAeoPdf({
      domain: project.domain,
      brandName: project.brand_name,
      latestScore,
      scoreHistory: scores || [],
      briefs: briefs || [],
    });

    const safeFilename = `${project.domain.replace(/[^a-zA-Z0-9.-]/g, '_')}-aeo-report.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('PDF export non-fatal catch:', error);
    // Never crash with raw 500 error page
    const errorPdf = generateAeoPdf({
      domain: 'aeo-report.com',
      brandName: 'AEO Checker',
      latestScore: {
        visibility_score: 0,
        share_of_voice_pct: 0,
        total_mentions: 0,
        competitor_mentions: 0,
        keywords_covered: 0,
        keywords_total: 0,
        snapshot_date: new Date().toISOString().split('T')[0],
      },
      scoreHistory: [],
      briefs: [
        {
          gap_type: 'Export Notice',
          gap_description: error?.message || 'Report could not be retrieved at this moment. Please try again.',
        },
      ],
    });

    return new NextResponse(new Uint8Array(errorPdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="aeo-notice-report.pdf"',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      },
    });
  }
}
