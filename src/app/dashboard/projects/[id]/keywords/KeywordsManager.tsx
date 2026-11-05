'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search } from 'lucide-react';

interface Keyword {
  id: string;
  keyword: string;
  intent: string;
  source: string;
  active: boolean;
}

interface KeywordsManagerProps {
  projectId: string;
  initialKeywords: Keyword[];
  plan: 'free' | 'starter' | 'pro';
}

export function KeywordsManager({ projectId, initialKeywords, plan }: KeywordsManagerProps) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const supabase = createClient();

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    // Plan enforcement: check if user has reached keyword limit
    // Free plan: 10 keywords max
    if (keywords.length >= 10) {
      alert('You have reached the keyword limit for your plan. Upgrade to add more keywords.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('keywords')
      .insert({
        project_id: projectId,
        keyword: newKeyword.trim(),
        intent: 'informational',
        source: 'user',
        active: true,
      })
      .select()
      .single();

    if (!error && data) {
      setKeywords([data, ...keywords]);
      setNewKeyword('');
    }
    setLoading(false);
  };

  const handleDiscover = async () => {
    setDiscoverLoading(true);
    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.error || 'Discovery failed');
      } else if (result.keywords && result.keywords.length > 0) {
        setKeywords([...result.keywords, ...keywords]);
        alert(`Discovered ${result.keywords.length} new keywords!`);
      } else {
        alert(result.message || 'No new keywords found.');
      }
    } catch (error) {
      alert('Discovery failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setDiscoverLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('keywords').delete().eq('id', id);
    setKeywords(keywords.filter(k => k.id !== id));
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 items-center">
        <form onSubmit={handleAddKeyword} className="flex gap-2 flex-1">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Enter keyword"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>
        <button
          onClick={handleDiscover}
          disabled={discoverLoading}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          Discover Keywords
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((kw) => (
              <tr key={kw.id}>
                <td className="px-6 py-4 whitespace-nowrap">{kw.keyword}</td>
                <td className="px-6 py-4 whitespace-nowrap">{kw.intent}</td>
                <td className="px-6 py-4 whitespace-nowrap">{kw.source}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(kw.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}