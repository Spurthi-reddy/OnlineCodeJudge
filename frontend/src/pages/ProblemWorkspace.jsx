import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import CodeEditor from '../components/CodeEditor';
import ConsoleOutput from '../components/ConsoleOutput';
import AiMentorPanel from '../components/AiMentorPanel';
import EdgeCaseGenerator from '../components/EdgeCaseGenerator';
import PerformanceChart from '../components/PerformanceChart';
import { ArrowLeft, Clock, Sparkles, Brain, Cpu, MessageSquareWarning, BarChart2, Loader2, AlertCircle } from 'lucide-react';

const ProblemWorkspace = () => {
  const { slug } = useParams();
  const { token, refreshPoints } = useAuth();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editor and Code Run states
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [consoleTab, setConsoleTab] = useState('testcases');

  // Next-Gen panels toggle states
  const [activeSidecar, setActiveSidecar] = useState(null); // 'mentor' | 'edgecases' | 'performance' | null
  const [submitTriggerCount, setSubmitTriggerCount] = useState(0); // Tracks successful submissions to refresh charts

  // Fetch Problem details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`/api/problems/${slug}`);
        const data = await res.json();
        if (data.success) {
          setProblem(data.problem);
        } else {
          setError(data.message || 'Problem not found');
        }
      } catch (err) {
        setError('Error fetching problem details');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  // Handler to run code against sample test cases
  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setRunResults(null);
    setSubmitResult(null);
    setConsoleTab('output');

    try {
      const res = await fetch('/api/submissions/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemId: problem._id,
          code,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error executing code');
      }

      setRunResults(data.results);
    } catch (err) {
      alert(err.message || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  // Handler to submit code against full hidden test cases
  const handleSubmitCode = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setRunResults(null);
    setSubmitResult(null);
    setConsoleTab('output');

    try {
      const res = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemId: problem._id,
          code,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error submitting solution');
      }

      setSubmitResult(data.submission);
      
      // If code was accepted, update global points context and trigger performance curves reload
      if (data.submission.status === 'Accepted') {
        refreshPoints();
        setSubmitTriggerCount(prev => prev + 1);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler to inject synthetic edge case as a runtime scenario parameter
  const handleLoadEdgeCaseInput = (testCaseInput, expectedOutput) => {
    // Insert edgecase as a custom test case simulation inside sample test cases for interactive runs
    if (problem) {
      const updatedProblem = { ...problem };
      // Append case
      updatedProblem.sampleTestCases = [
        ...updatedProblem.sampleTestCases,
        {
          input: testCaseInput,
          output: expectedOutput,
          explanation: 'Synthetically generated boundary case',
        }
      ];
      setProblem(updatedProblem);
      // Switch focus to sample testcases tab
      setConsoleTab('testcases');
      // Toast message
      alert('Edge case added to your Test Cases list below. Click "Run Code" to test it.');
    }
  };

  if (loading) {
    return (
      <div class="flex flex-grow h-full items-center justify-center bg-dark-950 text-slate-400 py-20 gap-3">
        <Loader2 class="h-10 w-10 text-brand-500 animate-spin" />
        <span class="text-sm font-semibold animate-pulse">Initializing coding playground...</span>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div class="mx-auto max-w-md text-center py-20 space-y-4">
        <AlertCircle class="h-12 w-12 text-rose-500 mx-auto" />
        <h2 class="text-xl font-bold text-slate-200">Playground Loading Failed</h2>
        <p class="text-slate-400 text-xs">{error || 'The requested problem could not be found.'}</p>
        <Link to="/" class="inline-block rounded bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div class="flex-grow flex flex-col min-h-0 bg-dark-950 text-slate-100">
      
      {/* Small Utility Workspace Sub-Header */}
      <div class="flex h-12 items-center justify-between border-b border-dark-800 bg-dark-950 px-4">
        <Link to="/" class="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft class="h-4 w-4" /> Back to Catalog
        </Link>
        
        {/* Next-Gen Sidecar Panel Toggles */}
        <div class="flex items-center gap-2">
          {/* Mentor */}
          <button
            onClick={() => setActiveSidecar(activeSidecar === 'mentor' ? null : 'mentor')}
            class={`flex items-center gap-1 px-3 py-1 rounded-lg border text-2xs font-bold transition-all ${
              activeSidecar === 'mentor'
                ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                : 'border-dark-800 bg-dark-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain class="h-3.5 w-3.5" /> Mentor
          </button>
          
          {/* Edge Cases */}
          <button
            onClick={() => setActiveSidecar(activeSidecar === 'edgecases' ? null : 'edgecases')}
            class={`flex items-center gap-1 px-3 py-1 rounded-lg border text-2xs font-bold transition-all ${
              activeSidecar === 'edgecases'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : 'border-dark-800 bg-dark-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles class="h-3.5 w-3.5" /> Edge Cases
          </button>

          {/* Performance curves */}
          <button
            onClick={() => setActiveSidecar(activeSidecar === 'performance' ? null : 'performance')}
            class={`flex items-center gap-1 px-3 py-1 rounded-lg border text-2xs font-bold transition-all ${
              activeSidecar === 'performance'
                ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                : 'border-dark-800 bg-dark-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 class="h-3.5 w-3.5" /> Optimization Curve
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Description, Right Code Editor / Console */}
      <div class="flex-grow flex min-h-0 relative">
        
        {/* Workspace Grid Container */}
        <div class={`flex-grow grid grid-cols-1 md:grid-cols-2 p-4 gap-4 min-h-0 transition-all ${
          activeSidecar ? 'md:pr-[360px]' : ''
        }`}>
          
          {/* Column A: Problem Statement */}
          <div class="flex flex-col bg-dark-900 border border-dark-800 rounded-xl overflow-hidden min-h-0">
            <div class="flex h-12 items-center bg-dark-950 px-4 border-b border-dark-800">
              <span class="text-xs font-bold text-slate-200 uppercase tracking-wider">Problem Description</span>
            </div>
            
            <div class="flex-grow p-5 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-300">
              {/* Problem Title & Stats */}
              <div class="space-y-2 border-b border-dark-800/80 pb-4">
                <h2 class="text-xl font-bold text-white">{problem.title}</h2>
                <div class="flex items-center gap-3">
                  <span class={`rounded-full border px-2.5 py-0.5 text-3xs font-extrabold ${
                    problem.difficulty === 'Easy' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                    problem.difficulty === 'Medium' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                    'text-rose-400 border-rose-500/20 bg-rose-500/10'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span class="text-xs text-slate-500">Acceptance Rate: <strong class="text-slate-300">{problem.acceptanceRate}%</strong></span>
                  <span class="text-xs text-slate-500">Points: <strong class="text-slate-300">{problem.points} XP</strong></span>
                </div>
              </div>

              {/* Markdown Description */}
              <div class="prose prose-invert prose-xs max-w-none text-slate-300">
                <ReactMarkdown>{problem.description}</ReactMarkdown>
              </div>

              {/* Constraints */}
              {problem.constraints && problem.constraints.length > 0 && (
                <div class="space-y-2 pt-4 border-t border-dark-800/80">
                  <div class="text-xs font-bold text-slate-200">Constraints:</div>
                  <ul class="list-disc pl-5 space-y-1 text-xs text-slate-400 font-mono">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Column B: IDE & Tabbed Console Console Output */}
          <div class="flex flex-col min-h-0 gap-4">
            
            {/* Top half: Monaco editor */}
            <div class="flex-grow min-h-0 h-3/5">
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                problemTitle={problem.title}
                onRun={handleRunCode}
                onSubmit={handleSubmitCode}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Bottom half: Console result tabs */}
            <div class="h-2/5 min-h-0">
              <ConsoleOutput
                runResults={runResults}
                submitResult={submitResult}
                activeTab={consoleTab}
                setActiveTab={setConsoleTab}
                sampleTestCases={problem.sampleTestCases}
              />
            </div>

          </div>

        </div>

        {/* Sidebar Overlay panel for Next-Gen productivity helper features */}
        {activeSidecar && (
          <div class="absolute right-0 top-0 bottom-0 w-full md:w-[350px] border-l border-dark-800 bg-dark-950 z-10 shadow-2xl p-4 animate-fade-in">
            {activeSidecar === 'mentor' && (
              <AiMentorPanel
                problemId={problem._id}
                userCode={code}
                language={language}
                submissionResult={submitResult || runResults}
              />
            )}
            
            {activeSidecar === 'edgecases' && (
              <EdgeCaseGenerator
                problemId={problem._id}
                userCode={code}
                language={language}
                onLoadTestCase={handleLoadEdgeCaseInput}
              />
            )}

            {activeSidecar === 'performance' && (
              <PerformanceChart
                problemId={problem._id}
                submitTriggerCount={submitTriggerCount}
              />
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default ProblemWorkspace;
