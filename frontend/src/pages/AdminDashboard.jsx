import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash, Shield, BookOpen, Layers, Users, FileCode, CheckCircle, Database } from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Problem creation form states
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [points, setPoints] = useState(10);
  const [description, setDescription] = useState('');
  
  // Array inputs
  const [categoryTagsInput, setCategoryTagsInput] = useState('');
  const [constraintsInput, setConstraintsInput] = useState('');

  // Test cases lists
  const [sampleTestCases, setSampleTestCases] = useState([{ input: '', output: '', explanation: '' }]);
  const [hiddenTestCases, setHiddenTestCases] = useState([{ input: '', output: '' }]);

  // Status metrics mocks for visual premium aesthetic
  const metrics = [
    { label: 'Platform Users', value: 142, icon: Users, color: 'text-brand-400 bg-brand-500/10' },
    { label: 'Active Tasks', value: 24, icon: FileCode, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Total Runs', value: 1045, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
  ];

  const handleAddSampleTestCase = () => {
    setSampleTestCases([...sampleTestCases, { input: '', output: '', explanation: '' }]);
  };

  const handleRemoveSampleTestCase = (index) => {
    setSampleTestCases(sampleTestCases.filter((_, i) => i !== index));
  };

  const handleSampleTestCaseChange = (index, field, value) => {
    const updated = [...sampleTestCases];
    updated[index][field] = value;
    setSampleTestCases(updated);
  };

  const handleAddHiddenTestCase = () => {
    setHiddenTestCases([...hiddenTestCases, { input: '', output: '' }]);
  };

  const handleRemoveHiddenTestCase = (index) => {
    setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== index));
  };

  const handleHiddenTestCaseChange = (index, field, value) => {
    const updated = [...hiddenTestCases];
    updated[index][field] = value;
    setHiddenTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parse array inputs
    const tags = categoryTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    const constraints = constraintsInput
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    // Validate inputs
    if (!title || !description) {
      alert('Please fill out the title and description');
      return;
    }

    const payload = {
      title,
      description,
      difficulty,
      points: Number(points),
      categoryTags: tags,
      constraints,
      sampleTestCases: sampleTestCases.filter(tc => tc.input && tc.output),
      hiddenTestCases: hiddenTestCases.filter(tc => tc.input && tc.output),
    };

    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert('Problem created successfully!');
        navigate('/');
      } else {
        alert(data.message || 'Failed to create problem');
      }
    } catch (error) {
      console.error(error);
      alert('Network error creating problem');
    }
  };

  return (
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow">
      
      {/* Title Banner */}
      <div class="flex items-center gap-3 border-b border-dark-800 pb-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <Shield class="h-6 w-6" />
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-white">Admin Management Dashboard</h1>
          <p class="text-xs text-slate-400">Upload, monitor, and configure coding problem test suites.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} class="glass-panel p-4 rounded-xl border border-dark-800/80 flex items-center gap-4">
            <div class={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}>
              <m.icon class="h-5 w-5" />
            </div>
            <div>
              <span class="text-3xs text-slate-500 uppercase font-bold tracking-wider">{m.label}</span>
              <div class="text-lg font-black text-slate-200 font-mono">{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Problem Section */}
      <div class="glass-panel rounded-xl border border-dark-800/80 p-6 space-y-6">
        <div class="flex items-center gap-2 border-b border-dark-800 pb-3">
          <BookOpen class="h-4.5 w-4.5 text-brand-400" />
          <h2 class="text-sm font-bold text-slate-200">Upload New Coding Problem</h2>
        </div>

        <form onSubmit={handleSubmit} class="space-y-6 text-xs">
          
          {/* Row 1: Title, Difficulty, Points */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-1">
              <label class="text-3xs uppercase font-bold text-slate-400">Problem Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Two Sum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                class="w-full bg-dark-900 border border-dark-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div class="space-y-1">
              <label class="text-3xs uppercase font-bold text-slate-400">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                class="w-full bg-dark-900 border border-dark-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-3xs uppercase font-bold text-slate-400">XP Points</label>
              <input
                type="number"
                required
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                class="w-full bg-dark-900 border border-dark-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Row 2: Tags & Constraints */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-3xs uppercase font-bold text-slate-400">Category Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Arrays, Hash Table, Dynamic Programming"
                value={categoryTagsInput}
                onChange={(e) => setCategoryTagsInput(e.target.value)}
                class="w-full bg-dark-900 border border-dark-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div class="space-y-1">
              <label class="text-3xs uppercase font-bold text-slate-400">Constraints (one per line)</label>
              <textarea
                placeholder="e.g. 2 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
                value={constraintsInput}
                onChange={(e) => setConstraintsInput(e.target.value)}
                class="w-full bg-dark-900 border border-dark-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-mono h-20 resize-none"
              />
            </div>
          </div>

          {/* Row 3: Description (Markdown support) */}
          <div class="space-y-1">
            <label class="text-3xs uppercase font-bold text-slate-400">Problem Description (Markdown Supported)</label>
            <textarea
              required
              rows="6"
              placeholder="Provide a detailed description of the problem, input-output examples, and explanations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              class="w-full bg-dark-900 border border-dark-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-sans"
            />
          </div>

          {/* Sample Test cases */}
          <div class="space-y-4 border-t border-dark-800/80 pt-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-300">Public Sample Test Cases</span>
              <button
                type="button"
                onClick={handleAddSampleTestCase}
                class="flex items-center gap-1 text-3xs text-brand-400 font-semibold uppercase hover:bg-brand-500/5 px-2.5 py-1 rounded border border-brand-500/10 transition-colors"
              >
                <Plus class="h-3 w-3" /> Add Case
              </button>
            </div>

            <div class="space-y-4">
              {sampleTestCases.map((tc, idx) => (
                <div key={idx} class="grid grid-cols-1 md:grid-cols-3 gap-3 border border-dark-800 bg-dark-900/10 p-3 rounded-lg relative">
                  <div class="space-y-1">
                    <label class="text-3xs text-slate-500 uppercase font-bold">Input</label>
                    <textarea
                      value={tc.input}
                      onChange={(e) => handleSampleTestCaseChange(idx, 'input', e.target.value)}
                      class="w-full bg-dark-900 border border-dark-800 rounded p-1.5 font-mono h-14 text-2xs resize-none"
                      placeholder="e.g. [2,7,11,15]\n9"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-3xs text-slate-500 uppercase font-bold">Output</label>
                    <textarea
                      value={tc.output}
                      onChange={(e) => handleSampleTestCaseChange(idx, 'output', e.target.value)}
                      class="w-full bg-dark-900 border border-dark-800 rounded p-1.5 font-mono h-14 text-2xs resize-none"
                      placeholder="e.g. [0,1]"
                    />
                  </div>
                  <div class="space-y-1 pr-6">
                    <label class="text-3xs text-slate-500 uppercase font-bold">Explanation</label>
                    <textarea
                      value={tc.explanation}
                      onChange={(e) => handleSampleTestCaseChange(idx, 'explanation', e.target.value)}
                      class="w-full bg-dark-900 border border-dark-800 rounded p-1.5 font-sans h-14 text-2xs resize-none"
                      placeholder="Brief note why this output matches"
                    />
                  </div>
                  {sampleTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSampleTestCase(idx)}
                      class="absolute top-2 right-2 text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                    >
                      <Trash class="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Test cases */}
          <div class="space-y-4 border-t border-dark-800/80 pt-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-300">Hidden Evaluation Test Cases</span>
              <button
                type="button"
                onClick={handleAddHiddenTestCase}
                class="flex items-center gap-1 text-3xs text-amber-400 font-semibold uppercase hover:bg-amber-500/5 px-2.5 py-1 rounded border border-amber-500/10 transition-colors"
              >
                <Plus class="h-3 w-3" /> Add Case
              </button>
            </div>

            <div class="space-y-4">
              {hiddenTestCases.map((tc, idx) => (
                <div key={idx} class="grid grid-cols-1 md:grid-cols-2 gap-3 border border-dark-800 bg-dark-900/10 p-3 rounded-lg relative">
                  <div class="space-y-1">
                    <label class="text-3xs text-slate-500 uppercase font-bold">Input</label>
                    <textarea
                      value={tc.input}
                      onChange={(e) => handleHiddenTestCaseChange(idx, 'input', e.target.value)}
                      class="w-full bg-dark-900 border border-dark-800 rounded p-1.5 font-mono h-14 text-2xs resize-none"
                    />
                  </div>
                  <div class="space-y-1 pr-6">
                    <label class="text-3xs text-slate-500 uppercase font-bold">Output</label>
                    <textarea
                      value={tc.output}
                      onChange={(e) => handleHiddenTestCaseChange(idx, 'output', e.target.value)}
                      class="w-full bg-dark-900 border border-dark-800 rounded p-1.5 font-mono h-14 text-2xs resize-none"
                    />
                  </div>
                  {hiddenTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHiddenTestCase(idx)}
                      class="absolute top-2 right-2 text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                    >
                      <Trash class="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div class="flex justify-end gap-3 pt-6 border-t border-dark-800/80">
            <Link
              to="/"
              class="rounded-lg border border-dark-800 bg-dark-950 hover:bg-dark-900 px-5 py-2 font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              class="rounded-lg bg-brand-600 hover:bg-brand-500 px-5 py-2 font-extrabold text-white hover:shadow-lg hover:shadow-brand-500/15 transition-all"
            >
              Upload Problem
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AdminDashboard;
