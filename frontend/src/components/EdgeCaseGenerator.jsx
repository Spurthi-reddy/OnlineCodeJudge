import React, { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EdgeCaseGenerator = ({ problemId, userCode, language, onLoadTestCase }) => {
  const { token } = useAuth();
  const [edgeCases, setEdgeCases] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setEdgeCases(null);

    try {
      const res = await fetch('/api/ai/edge-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemId,
          userCode,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate edge cases');
      }

      setEdgeCases(data.edgeCases);
    } catch (err) {
      setError(err.message || 'Error generating boundary conditions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex flex-col h-full bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
      
      {/* Header */}
      <div class="flex h-12 items-center justify-between bg-dark-950 px-4 border-b border-dark-800">
          <div class="flex items-center gap-2">
            <Sparkles class="h-4.5 w-4.5 text-amber-400" />
            <span class="text-xs font-bold text-slate-200">Edge Case Generator</span>
          </div>
      </div>

      {/* Content */}
      <div class="flex-grow p-4 overflow-y-auto space-y-4 text-xs font-mono">
        
        {!edgeCases && !loading && (
          <div class="flex flex-col items-center justify-center py-10 text-center space-y-4 font-sans">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Sparkles class="h-6 w-6 text-amber-400" />
            </div>
            <div class="space-y-1 px-4">
              <div class="font-bold text-slate-200">Stress Test Your Logic</div>
              <p class="text-slate-400 leading-relaxed max-w-xs text-xs">
                Before final submission, request the service to analyze your code and generate 2-3 boundary test cases (empty states, heavy integer bounds, duplicates).
              </p>
            </div>

            <button
              onClick={handleGenerate}
              class="rounded-lg bg-amber-600 hover:bg-amber-500 px-4 py-2 font-bold text-white shadow-md shadow-amber-600/10 transition-all"
            >
              Generate Edge Cases
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div class="flex flex-col items-center justify-center py-16 space-y-3 font-sans">
            <Loader2 class="h-8 w-8 text-amber-500 animate-spin" />
            <span class="text-slate-400 animate-pulse font-medium">Generating edge cases...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div class="rounded-lg border border-red-500/10 bg-red-500/5 p-3 flex gap-2 items-start text-red-400 font-sans">
            <AlertTriangle class="h-4.5 w-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Edge case list */}
        {edgeCases && (
          <div class="space-y-4 animate-fade-in">
            <div class="text-2xs text-slate-400 font-sans border-b border-dark-800 pb-2">
              Generated {edgeCases.length} edge cases tailored to your implementation:
            </div>

            {edgeCases.map((ec, idx) => (
              <div key={idx} class="rounded-lg border border-dark-800 bg-dark-950/40 p-3 space-y-2.5">
                {/* Description */}
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs font-semibold text-amber-400 font-sans leading-tight">
                    {idx + 1}. {ec.description}
                  </span>
                  
                  {/* Load Case into workspace */}
                  <button
                    onClick={() => onLoadTestCase(ec.input, ec.expected)}
                    class="flex items-center gap-1 text-3xs text-brand-400 hover:text-brand-300 font-semibold uppercase hover:bg-brand-500/5 px-2 py-0.5 rounded border border-brand-500/10 transition-colors font-sans"
                    title="Load into console runner"
                  >
                    <Plus class="h-3 w-3" /> Use Case
                  </button>
                </div>

                {/* Inputs and expected outputs */}
                <div class="grid grid-cols-1 gap-2 text-2xs">
                  <div>
                    <span class="text-3xs text-slate-500 uppercase tracking-wide">Input Parameter</span>
                    <pre class="bg-dark-900/60 p-2 rounded border border-dark-800/40 max-h-24 overflow-y-auto whitespace-pre-wrap mt-0.5">
                      {ec.input}
                    </pre>
                  </div>
                  <div>
                    <span class="text-3xs text-slate-500 uppercase tracking-wide">Expected Output</span>
                    <pre class="bg-dark-900/60 p-2 rounded border border-dark-800/40 whitespace-pre-wrap mt-0.5 text-emerald-400">
                      {ec.expected}
                    </pre>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleGenerate}
              class="w-full rounded-lg border border-dark-800 bg-dark-950 hover:bg-dark-900 py-2 text-center font-bold text-slate-400 hover:text-slate-200 transition-colors font-sans"
            >
              Re-Generate Edge Cases
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default EdgeCaseGenerator;
