export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
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

    // Load pdfmake dynamically
    const pdfmakeModule = await import('pdfmake/build/pdfmake');
    const vfsFonts = await import('pdfmake/build/vfs_fonts');
    const URLResolver = (await import('pdfmake/js/URLResolver')).default;
    const Printer = (await import('pdfmake/js/Printer')).default;

    // Convert base64 strings to buffers for fonts
    const vfs: Record<string, Buffer> = {};
    Object.keys(vfsFonts.default).forEach((filename: string) => {
      vfs[filename] = Buffer.from(vfsFonts.default[filename], 'base64');
    });

    // Initialize printer with fonts and virtual filesystem
    const printer = new Printer({
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf',
      },
    }, {
      storage: vfs,
      existsSync: (filename: string) => filename in vfs,
      readFileSync: (filename: string) => vfs[filename],
    } as any, new URLResolver());

    // Build PDF content
    const latestScore = scores && scores.length > 0 ? scores[scores.length - 1] : null;
    const scoreHistory = scores || [];

    const docDefinition: any = {
      content: [
        // Title
        {
          text: 'AEO Visibility Report',
          style: 'header',
          alignment: 'center',
        },
        {
          text: `${project.domain}`,
          style: 'subtitle',
          alignment: 'center',
        },
        {
          text: `Brand: ${project.brand_name || 'N/A'}`,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },

        // Latest Score Summary
        ...(latestScore ? [
          {
            text: 'Latest Scan Results',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          [
            {
              columns: [
                {
                  text: 'Visibility Score',
                  style: 'scoreLabel',
                },
                {
                  text: String(latestScore.visibility_score),
                  style: 'scoreValue',
                },
                {
                  text: 'Share of Voice',
                  style: 'scoreLabel',
                },
                {
                  text: `${latestScore.share_of_voice_pct}%`,
                  style: 'scoreValue',
                },
              ],
              gap: 20,
            },
            {
              columns: [
                {
                  text: 'Total Mentions',
                  style: 'scoreLabel',
                },
                {
                  text: String(latestScore.total_mentions),
                  style: 'scoreValue',
                },
                {
                  text: 'Competitor Mentions',
                  style: 'scoreLabel',
                },
                {
                  text: String(latestScore.competitor_mentions),
                  style: 'scoreValue',
                },
              ],
              gap: 20,
            },
            {
              columns: [
                {
                  text: 'Keywords Covered',
                  style: 'scoreLabel',
                },
                {
                  text: `${latestScore.keywords_covered}/${latestScore.keywords_total}`,
                  style: 'scoreValue',
                },
                {
                  text: 'Scan Date',
                  style: 'scoreLabel',
                },
                {
                  text: latestScore.snapshot_date,
                  style: 'scoreValue',
                },
              ],
              gap: 20,
            },
          ],
          { margin: [0, 0, 0, 20] },
        ] : []),

        // Score History Table
        ...(scoreHistory.length > 0 ? [
          {
            text: 'Score History',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'Auto', 'Auto', 'Auto', 'Auto', 'Auto', 'Auto'],
              body: [
                [
                  { text: 'Date', style: 'tableHeader' },
                  { text: 'Visibility', style: 'tableHeader' },
                  { text: 'SoV %', style: 'tableHeader' },
                  { text: 'Mentions', style: 'tableHeader' },
                  { text: 'Comp. Mentions', style: 'tableHeader' },
                  { text: 'Keywords', style: 'tableHeader' },
                ],
                ...scoreHistory.map((s: any) => [
                  s.snapshot_date,
                  String(s.visibility_score),
                  `${s.share_of_voice_pct}%`,
                  String(s.total_mentions),
                  String(s.competitor_mentions),
                  `${s.keywords_covered}/${s.keywords_total}`,
                ]),
              ],
            },
            margin: [0, 0, 0, 20],
          },
        ] : []),

        // Fix Briefs
        ...(briefs && briefs.length > 0 ? [
          {
            text: 'Top Fix Briefs',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          ...briefs.flatMap((brief: any) => [
            { text: `${brief.gap_type}`, style: 'briefTitle' },
            { text: brief.gap_description, style: 'briefDesc', margin: [0, 0, 0, 8] },
          ]),
        ] : [
          {
            text: 'No fix briefs generated yet.',
            style: 'muted',
            margin: [0, 0, 0, 20],
          },
        ]),

        // Footer
        {
          text: 'Generated by AEO Visibility Tracker',
          style: 'footer',
          alignment: 'center',
          margin: [0, 40, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          color: '#1a1a2e',
          margin: [0, 0, 0, 8],
        },
        subtitle: {
          fontSize: 16,
          color: '#555',
          margin: [0, 0, 0, 4],
        },
        sectionHeader: {
          fontSize: 18,
          bold: true,
          color: '#eb9d2a',
          margin: [0, 16, 0, 8],
        },
        scoreLabel: {
          fontSize: 12,
          color: '#666',
        },
        scoreValue: {
          fontSize: 14,
          bold: true,
          color: '#1a1a2e',
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          color: '#fff',
          fill: '#4a5568',
          border: [1, 1, 1, 1],
        },
        briefTitle: {
          fontSize: 13,
          bold: true,
          color: '#c53030',
        },
        briefDesc: {
          fontSize: 11,
          color: '#555',
          italics: true,
        },
        muted: {
          fontSize: 12,
          color: '#888',
        },
        footer: {
          fontSize: 10,
          color: '#999',
          margin: [0, 20, 0, 0],
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
    };

    // Generate PDF
    const pdfDoc = await printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise<NextResponse>((resolve) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${project.domain}-report.pdf"`,
          },
        }));
      });
      pdfDoc.end();
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 },
    );
  }
}
