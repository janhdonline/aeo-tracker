import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'supabase', 'schema.sql');
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf-8');
      return new NextResponse(sql, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }
    return NextResponse.json({ error: 'schema.sql not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
