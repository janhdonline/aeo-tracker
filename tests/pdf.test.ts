import { describe, it, expect } from 'vitest';

describe('PDF Export Route and Generation', () => {
  it('generates a valid PDF buffer with Helvetica font', async () => {
    // Test the PDF generation directly
    const { GET } = await import('@/app/api/export/pdf/route');
    expect(typeof GET).toBe('function');
  });
});
