'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save } from 'lucide-react';

interface BrandFact {
  id: string;
  fact_type: string;
  key: string;
  expected_value: string;
}

export default function BrandFactsPage({ params }: { params: { id: string } }) {
  const [facts, setFacts] = useState<BrandFact[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState('claim');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadFacts();
  }, [params.id]);

  const loadFacts = async () => {
    const { data } = await supabase
      .from('brand_facts')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at');
    setFacts(data || []);
  };

  const handleAdd = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('brand_facts')
      .insert({
        project_id: params.id,
        fact_type: newType,
        key: newKey.trim(),
        expected_value: newValue.trim(),
      })
      .select()
      .single();
    if (!error && data) {
      setFacts([...facts, data]);
      setNewKey('');
      setNewValue('');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('brand_facts').delete().eq('id', id);
    setFacts(facts.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Brand Facts Sheet</h1>
        <p className="text-slate-600 mb-8">
          Define what is TRUE about your brand. AI answers will be checked against these facts to detect hallucinations.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb9d2a] focus:border-transparent"
            >
              <option value="price">Price</option>
              <option value="feature">Feature</option>
              <option value="availability">Availability</option>
              <option value="status">Status</option>
              <option value="claim">Claim</option>
            </select>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="e.g. aeropress_pro"
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb9d2a] focus:border-transparent"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="e.g. $89"
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb9d2a] focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={loading || !newKey.trim() || !newValue.trim()}
            className="flex items-center gap-2 bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Fact
          </button>
        </div>

        {facts.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Value</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facts.map((fact) => (
                  <tr key={fact.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        fact.fact_type === 'price' ? 'bg-green-100 text-green-700' :
                        fact.fact_type === 'feature' ? 'bg-blue-100 text-blue-700' :
                        fact.fact_type === 'availability' ? 'bg-purple-100 text-purple-700' :
                        fact.fact_type === 'status' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {fact.fact_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{fact.key}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{fact.expected_value}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(fact.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium">No brand facts yet</p>
            <p className="mt-2">Add facts about your brand to enable hallucination detection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
