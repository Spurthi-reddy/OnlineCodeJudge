import React, { useState, useEffect } from 'react';
import { PlayCircle, AlertCircle, CheckCircle2, XCircle, Terminal, Clock, Database } from 'lucide-react';

const ConsoleOutput = ({ runResults, submitResult, activeTab, setActiveTab, sampleTestCases }) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  // Auto-switch tab to output when execution finishes
  useEffect(() => {
    if (runResults || submitResult) {
      setActiveTab('output');
    }
  }, [runResults, submitResult]);

  const getVerdictStyle = (status) => {
    switch (status) {
      case 'Accepted':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'Wrong Answer':
        return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
      case 'Time Limit Exceeded':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'Compilation Error':
      case 'Runtime Error':
        return 'text-red-400 border-red-500/20 bg-red-500/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800/50';
    }
  };

  return (
    <div class="flex h-full flex-col bg-dark-900 border border-dark-800 rounded-xl overflow-hidden font-mono">
      
      {/* Console Tab Selectors */}
      <div class="flex h-10 items-center bg-dark-950 px-4 border-b border-dark-800 justify-between">
        <div class="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('testcases')}
            class={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
              activeTab === 'testcases'
                ? 'bg-dark-900 text-slate-200 border-dark-800'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            Test Cases
          </button>
          <button
            onClick={() => setActiveTab('output')}
            class={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
              activeTab === 'output'
                ? 'bg-dark-900 text-slate-200 border-dark-800'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            Result Output
          </button>
        </div>
        <div class="flex items-center gap-1 text-3xs text-slate-500">
          <Terminal class="h-3 w-3" />
          <span>console</span>
        </div>
      </div>

      {/* Console Screen Pane */}
      <div class="flex-grow p-4 min-h-0 overflow-y-auto bg-dark-950/40 text-slate-300">
        {activeTab === 'testcases' ? (
          /* ================== Test Cases View ================== */
          <div class="space-y-4 font-mono text-xs">
            <div class="flex gap-2">
              {sampleTestCases.map((tc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCaseIdx(idx)}
                  class={`px-3 py-1 rounded-md text-xs border font-medium ${
                    selectedCaseIdx === idx
                      ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                      : 'border-dark-800 bg-dark-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            {sampleTestCases[selectedCaseIdx] && (
              <div class="space-y-3">
                <div>
                  <div class="text-3xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Input</div>
                  <pre class="bg-dark-900/60 p-3 rounded-lg border border-dark-800/50 max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {sampleTestCases[selectedCaseIdx].input}
                  </pre>
                </div>
                <div>
                  <div class="text-3xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Expected Output</div>
                  <pre class="bg-dark-900/60 p-3 rounded-lg border border-dark-800/50 whitespace-pre-wrap">
                    {sampleTestCases[selectedCaseIdx].output}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================== Output Results View ================== */
          <div class="h-full text-xs space-y-4">
            
            {/* If nothing evaluated yet */}
            {!runResults && !submitResult && (
              <div class="h-full flex flex-col items-center justify-center text-slate-500 py-6 gap-2">
                <PlayCircle class="h-8 w-8 text-dark-700 animate-pulse" />
                <span>Execute your code to review compilation outputs.</span>
              </div>
            )}

            {/* A: Handle RUN Results (Array of outcomes) */}
            {runResults && !submitResult && (
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-dark-800 pb-2">
                  <span class="text-sm font-bold text-slate-200">Execution Result (Run Code)</span>
                  <div class="flex gap-4 text-3xs text-slate-500 font-mono">
                    <span class="flex items-center gap-1">
                      <Clock class="h-3 w-3" /> Max Runtime: {Math.max(...runResults.map(r=>r.runtime || 0))}ms
                    </span>
                    <span class="flex items-center gap-1">
                      <Database class="h-3 w-3" /> Max Memory: {Math.max(...runResults.map(r=>parseFloat(((r.memory || 0)/1024).toFixed(2))))}MB
                    </span>
                  </div>
                </div>

                <div class="flex gap-2">
                  {runResults.map((r, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCaseIdx(idx)}
                      class={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 font-medium ${
                        selectedCaseIdx === idx
                          ? 'border-dark-700 bg-dark-900'
                          : 'border-transparent text-slate-400'
                      }`}
                    >
                      {r.passed ? (
                        <CheckCircle2 class="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <XCircle class="h-3.5 w-3.5 text-rose-400" />
                      )}
                      <span>Case {idx + 1}</span>
                    </button>
                  ))}
                </div>

                {runResults[selectedCaseIdx] && (
                  <div class="space-y-3 mt-2">
                    {/* Verdict */}
                    <div class="flex items-center gap-2">
                      <span class="text-3xs text-slate-500 uppercase font-bold">Verdict:</span>
                      <span class={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getVerdictStyle(runResults[selectedCaseIdx].status)}`}>
                        {runResults[selectedCaseIdx].status}
                      </span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div class="text-3xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Input</div>
                        <pre class="bg-dark-900/60 p-3 rounded-lg border border-dark-800/50 max-h-32 overflow-y-auto whitespace-pre-wrap text-2xs">
                          {runResults[selectedCaseIdx].input}
                        </pre>
                      </div>
                      <div>
                        <div class="text-3xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Expected Output</div>
                        <pre class="bg-dark-900/60 p-3 rounded-lg border border-dark-800/50 max-h-32 overflow-y-auto whitespace-pre-wrap text-2xs text-emerald-400">
                          {runResults[selectedCaseIdx].expectedOutput}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <div class="text-3xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Your Stdout</div>
                      <pre class={`p-3 rounded-lg border text-2xs max-h-32 overflow-y-auto whitespace-pre-wrap ${
                        runResults[selectedCaseIdx].passed ? 'bg-dark-900/60 border-dark-800/50 text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                      }`}>
                        {runResults[selectedCaseIdx].actualOutput || '(Empty Output)'}
                      </pre>
                    </div>

                    {runResults[selectedCaseIdx].errorLog && (
                      <div>
                        <div class="text-3xs text-red-500 uppercase tracking-wider mb-1 font-bold">Error Logs / Stderr</div>
                        <pre class="bg-red-950/20 border border-red-500/10 p-3 rounded-lg text-red-400 text-2xs overflow-x-auto max-h-40 whitespace-pre">
                          {runResults[selectedCaseIdx].errorLog}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* B: Handle SUBMIT Result (Single consolidated verdict) */}
            {submitResult && (
              <div class="space-y-4">
                <div class="border-b border-dark-800 pb-2">
                  <span class="text-sm font-bold text-slate-200">Execution Result (Code Submission)</span>
                </div>

                <div class="flex items-center gap-4 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="text-3xs text-slate-500 uppercase font-bold">Verdict:</span>
                    <span class={`text-sm px-4 py-1 rounded-full border font-bold ${getVerdictStyle(submitResult.status)}`}>
                      {submitResult.status}
                    </span>
                  </div>

                  {submitResult.status === 'Accepted' && (
                    <div class="flex gap-4 text-xs font-semibold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-4 py-1">
                      <span class="flex items-center gap-1">
                        <Clock class="h-3.5 w-3.5" /> {submitResult.runtime || 0} ms
                      </span>
                      <span class="flex items-center gap-1">
                        <Database class="h-3.5 w-3.5" /> {parseFloat(((submitResult.memory || 0)/1024).toFixed(2))} MB
                      </span>
                    </div>
                  )}
                </div>

                {/* If solution passed all tests */}
                {submitResult.status === 'Accepted' && (
                  <div class="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 space-y-2">
                    <div class="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 class="h-5 w-5" />
                      <span>All Test Cases Passed Successfully!</span>
                    </div>
                    <p class="text-slate-400 text-xs">
                      Congratulations! Your submission has been saved. Your profile score and optimization statistics are updated. Check the Leaderboard to view your updated rank!
                    </p>
                  </div>
                )}

                {/* If solution failed on hidden test cases */}
                {submitResult.status !== 'Accepted' && (
                  <div class="space-y-4">
                    <div class="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 flex gap-3 items-start">
                      <AlertCircle class="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                      <div class="space-y-1">
                        <div class="text-rose-400 font-bold text-sm">Submission Rejected</div>
                        <p class="text-slate-400 text-xs leading-relaxed">
                          Your code failed one or more validation test cases. Toggle the <span class="text-brand-400 font-semibold">mentor sidecar</span> on the right workspace panel to analyze your structural bugs and receive guided assistance!
                        </p>
                      </div>
                    </div>

                    {submitResult.failingTestCase && (
                      <div class="space-y-3">
                        <div class="text-xs font-bold text-slate-300">Failing Input Boundary:</div>
                        <pre class="bg-dark-900/60 p-3 rounded-lg border border-dark-800/50 max-h-32 overflow-y-auto text-2xs">
                          {submitResult.failingTestCase.input}
                        </pre>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div class="text-3xs text-slate-500 uppercase font-bold mb-1">Expected Output</div>
                            <pre class="bg-dark-900/60 p-3 rounded-lg border border-dark-800/50 text-emerald-400 text-2xs">
                              {submitResult.failingTestCase.expected}
                            </pre>
                          </div>
                          <div>
                            <div class="text-3xs text-slate-500 uppercase font-bold mb-1">Actual Stdout / Out</div>
                            <pre class="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-rose-400 text-2xs">
                              {submitResult.failingTestCase.actual || '(Empty Output)'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {submitResult.errorLog && (
                      <div>
                        <div class="text-3xs text-red-500 uppercase font-bold mb-1">Error Stream Log:</div>
                        <pre class="bg-red-950/20 border border-red-500/10 p-3 rounded-lg text-red-400 text-2xs overflow-x-auto max-h-40 whitespace-pre">
                          {submitResult.errorLog}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default ConsoleOutput;
