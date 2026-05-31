import React, { useState } from 'react';
import { Cpu, AlertTriangle, Sparkles, BookOpen, Clock, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AiMentorPanel = ({ problemId, userCode, language, submissionResult }) => {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const triggerAiMentor = async () => {
    if (!submissionResult) return;
    
    setLoading(true);
    setError('');
    setFeedback(null);

    const isRunCodeResult = Array.isArray(submissionResult);
    
    // Extract verdict information
    let verdict = 'Failed';
    let input = '';
    let expected = '';
    let actual = '';

    if (isRunCodeResult) {
      // Find first failed run case
      const failedCase = submissionResult.find(r => !r.passed);
      if (failedCase) {
        verdict = failedCase.status;
        input = failedCase.input;
        expected = failedCase.expectedOutput;
        actual = failedCase.actualOutput || failedCase.errorLog;
      }
    } else {
      verdict = submissionResult.status;
      input = submissionResult.failingTestCase?.input || 'N/A';
      expected = submissionResult.failingTestCase?.expected || 'N/A';
      actual = submissionResult.failingTestCase?.actual || submissionResult.errorLog || 'N/A';
    }

    try {
      const res = await fetch('/api/ai/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemId,
          userCode,
          language,
          verdict,
          input,
          expected,
          actual,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch feedback');
      }

      setFeedback(data.feedback);
    } catch (err) {
      setError(err.message || 'Error communicating with mentor service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex flex-col h-full bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
      
      {/* Panel Title Header */}
      <div class="flex h-12 items-center justify-between bg-dark-950 px-4 border-b border-dark-800">
          <div class="flex items-center gap-2">
          <Sparkles class="h-4.5 w-4.5 text-brand-400 animate-pulse" />
          <span class="text-xs font-bold text-slate-200">Debugging Mentor</span>
        </div>
      </div>

      {/* Pane Content */}
      <div class="flex-grow p-4 overflow-y-auto space-y-4 text-xs">
        
        {/* Trigger Button if feedback is empty */}
        {!feedback && !loading && (
          <div class="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
              <Cpu class="h-6 w-6 text-brand-400" />
            </div>
            <div class="space-y-1 px-4">
              <div class="font-bold text-slate-200">Need a hint?</div>
              <p class="text-slate-400 leading-relaxed max-w-xs">
                The mentor analyzes failed runs and boundary mismatches to help you fix bugs without spoiling the final solution.
              </p>
            </div>
            
            <button
              onClick={triggerAiMentor}
              disabled={!submissionResult}
              class="rounded-lg bg-brand-600 hover:bg-brand-500 px-4 py-2 font-bold text-white shadow-md shadow-brand-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Analyze Submission
            </button>
            {!submissionResult && (
              <span class="text-3xs text-slate-500">Run or Submit code first to request help.</span>
            )}
          </div>
        )}

        {/* Loading Shell */}
        {loading && (
          <div class="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 class="h-8 w-8 text-brand-500 animate-spin" />
            <span class="text-slate-400 animate-pulse font-medium">Mentor is analyzing your code...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div class="rounded-lg border border-red-500/10 bg-red-500/5 p-3 flex gap-2 items-start text-red-400">
            <AlertTriangle class="h-4.5 w-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Feedback Display */}
        {feedback && (
          <div class="space-y-4 animate-fade-in">
            
            {/* 1: Logic Hint */}
            <div class="rounded-xl border border-brand-500/15 bg-brand-500/5 p-4 space-y-2">
              <div class="flex items-center gap-2 text-brand-400 font-bold text-sm">
                <BookOpen class="h-4.5 w-4.5" />
                <span>Algorithmic Hint</span>
              </div>
              <p class="text-slate-300 leading-relaxed font-sans text-xs">
                {feedback.hint}
              </p>
            </div>

            {/* 2: Edge-case checklist */}
            <div class="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 space-y-2">
              <div class="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle class="h-4.5 w-4.5" />
                <span>Edge Cases Checklist</span>
              </div>
              <p class="text-slate-300 leading-relaxed font-sans text-xs">
                {feedback.edgeCases}
              </p>
            </div>

            {/* 3: Time & Space audit */}
            <div class="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-4 space-y-2">
              <div class="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Activity class="h-4.5 w-4.5" />
                <span>Complexity Audit</span>
              </div>
              <p class="text-slate-300 leading-relaxed font-sans text-xs">
                {feedback.efficiency}
              </p>
            </div>

            {/* Re-trigger action */}
            <button
              onClick={triggerAiMentor}
              class="w-full rounded-lg border border-dark-800 bg-dark-950 hover:bg-dark-900 py-2 text-center font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Re-Analyze Code
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default AiMentorPanel;
