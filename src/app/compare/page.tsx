import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AEO Tools Comparison — Best AI Visibility Trackers 2026',
  description: 'Compare the best AEO and AI visibility tracking tools. See how our tool differs from competitors like Scrunch, Profound, and SEMrush.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
  },
};

const comparisons = [
  {
    feature: 'AI Visibility Tracking',
    ours: 'All engines (ChatGPT, Gemini, Perplexity, Grok)',
    others: 'Limited to 1-2 engines',
  },
  {
    feature: 'Fix Briefs',
    ours: 'AI-generated actionable recommendations',
    others: 'Dashboard only, no action items',
  },
  {
    feature: 'Verification Loop',
    ours: 'Re-check after 14 days to see if fixes worked',
    others: 'No verification feature',
  },
  {
    feature: 'Source Intelligence',
    ours: 'See which websites AI uses as sources',
    others: 'Not available',
  },
  {
    feature: 'Pricing',
    ours: 'Flat $49-$79/mo, all engines included',
    others: '$250+/mo enterprise pricing',
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">AEO Tools Comparison</h1>
        <p className="text-xl text-slate-600 mb-12">See how we compare to other AI visibility tracking tools.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-4 pr-8 text-slate-900 font-semibold">Feature</th>
                <th className="py-4 px-8 text-[#eb9d2a] font-semibold">Our Tool</th>
                <th className="py-4 pl-8 text-slate-500 font-medium">Others</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-4 pr-8 font-medium text-slate-900">{row.feature}</td>
                  <td className="py-4 px-8 text-slate-700">{row.ours}</td>
                  <td className="py-4 pl-8 text-slate-500">{row.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">Ready to try it yourself?</p>
          <Link href="/dashboard/projects/new" className="inline-block bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
