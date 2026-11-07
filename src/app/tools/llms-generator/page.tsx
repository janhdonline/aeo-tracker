'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, Check } from 'lucide-react';
import { generateLlmsTxt } from '@/lib/llms-generator';

export default function LlmsGeneratorPage() {
  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!brandName || !domain) return;

    const result = generateLlmsTxt({
      brandName,
      domain,
      description: description || `${brandName} is a leading provider of innovative solutions.`,
    });

    setOutput(result.llmsTxt);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <FileText className="h-12 w-12 text-[#eb9d2a] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">llms.txt Generator</h1>
          <p className="mt-2 text-slate-600">Generate honest llms.txt files for AI agents and IDE assistants.</p>
          <p className="mt-1 text-sm text-slate-500">This will NOT boost your ChatGPT/Gemini rankings. It makes your site more discoverable by agents.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name *</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb9d2a] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Domain *</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="acme.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb9d2a] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your company and products..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb9d2a] focus:border-transparent"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!brandName || !domain}
              className="w-full bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              Generate llms.txt
            </button>
          </div>
        </div>

        {output && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-slate-900 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">llms.txt</h2>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                {output}
              </pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> Save this as <code className="bg-blue-100 px-1 py-0.5 rounded">llms.txt</code> in your website root. Place a more detailed version as <code className="bg-blue-100 px-1 py-0.5 rounded">llms-full.txt</code>.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
