'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Plus, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

export function KeywordsManager({ projectId, initialKeywords, plan }: KeywordsManagerProps) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    if (keywords.length >= 10) {
      alert('You have reached the keyword limit for your plan. Upgrade to add more keywords.');
      return;
    }

    setIsAdding(true);
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
    setIsAdding(false);
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <motion.button
            type="submit"
            disabled={loading || !newKeyword.trim()}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: newKeyword.trim() ? 1.02 : 1 }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </motion.button>
        </form>
        <motion.button
          onClick={handleDiscover}
          disabled={discoverLoading}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: discoverLoading ? 1 : 1.02 }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <Sparkles className={`h-4 w-4 ${discoverLoading ? 'animate-spin' : ''}`} />
          Discover Keywords
        </motion.button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <AnimatePresence mode="popLayout">
            <tbody className="bg-white divide-y divide-gray-200">
              {keywords.map((kw) => (
                <motion.tr
                  key={kw.id}
                  variants={item}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                  whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.04)' }}
                  className="group"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{kw.keyword}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      kw.intent === 'commercial' ? 'bg-purple-100 text-purple-800' :
                      kw.intent === 'navigational' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {kw.intent}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      kw.source === 'discovery' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {kw.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.button
                      onClick={() => handleDelete(kw.id)}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </AnimatePresence>
        </table>
        {keywords.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <p>No keywords yet. Add some or discover new ones!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
