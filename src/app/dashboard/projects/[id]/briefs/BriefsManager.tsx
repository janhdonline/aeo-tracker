'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Brief {
  id: string;
  gap_type: string;
  gap_description: string;
  recommendation: {
    action: string;
    target: string;
    content_hint: string;
    priority: string;
  };
  status: string;
  created_at: string;
}

export function BriefsManager({ projectId, initialBriefs }: { projectId: string; initialBriefs: Brief[] }) {
  const [briefs, setBriefs] = useState(initialBriefs);
  const supabase = createClient();

  const handleMarkApplied = async (id: string) => {
    const { error } = await supabase
      .from('fix_briefs')
      .update({ status: 'applied', applied_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setBriefs(briefs.map(b => b.id === id ? { ...b, status: 'applied' } : b));
    }
  };

  const handleDismiss = async (id: string) => {
    const { error } = await supabase
      .from('fix_briefs')
      .update({ status: 'dismissed' })
      .eq('id', id);

    if (!error) {
      setBriefs(briefs.map(b => b.id === id ? { ...b, status: 'dismissed' } : b));
    }
  };

  const openBriefs = briefs.filter(b => b.status === 'open');
  const appliedBriefs = briefs.filter(b => b.status === 'applied');
  const dismissedBriefs = briefs.filter(b => b.status === 'dismissed');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Open Briefs ({openBriefs.length})</h3>
        <div className="space-y-4">
          {openBriefs.map((brief) => (
            <div key={brief.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">{brief.gap_type}</span>
                  <p className="mt-1">{brief.gap_description}</p>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium">Recommendation:</p>
                    <p className="text-sm text-gray-600">{brief.recommendation.content_hint}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Action: {brief.recommendation.action} | Target: {brief.recommendation.target} | Priority: {brief.recommendation.priority}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkApplied(brief.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Mark Applied
                  </button>
                  <button
                    onClick={() => handleDismiss(brief.id)}
                    className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {appliedBriefs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Applied ({appliedBriefs.length})</h3>
          <div className="space-y-2">
            {appliedBriefs.map((brief) => (
              <div key={brief.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
                <p className="text-sm">{brief.gap_description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {dismissedBriefs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Dismissed ({dismissedBriefs.length})</h3>
          <div className="space-y-2">
            {dismissedBriefs.map((brief) => (
              <div key={brief.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400 opacity-60">
                <p className="text-sm">{brief.gap_description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}