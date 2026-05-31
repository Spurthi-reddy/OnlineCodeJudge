import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Trophy, CheckCircle, Tag, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Build filter parameters
      let problemUrl = '/api/problems';
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (difficulty) params.push(`difficulty=${difficulty}`);
      if (selectedTag) params.push(`tag=${encodeURIComponent(selectedTag)}`);
      if (params.length > 0) problemUrl += `?${params.join('&')}`;

      // Fetch problems
      const resProblems = await fetch(problemUrl);
      const dataProblems = await resProblems.json();

      // Fetch leaderboard
      const resLeaderboard = await fetch('/api/submissions/leaderboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const dataLeaderboard = await resLeaderboard.json();

      // Fetch unique tags
      const resTags = await fetch('/api/problems/tags');
      const dataTags = await resTags.json();

      if (dataProblems.success) setProblems(dataProblems.problems);
      if (dataLeaderboard.success) setLeaderboard(dataLeaderboard.leaderboard);
      if (dataTags.success) setTags(dataTags.tags);

    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search, difficulty, selectedTag]);

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-800/50';
    }
  };

  return (
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-grow flex flex-col">
      
      {/* Banner / Welcome Header */}
      <div class="rounded-2xl bg-gradient-to-r from-dark-900 via-dark-900 to-brand-950/20 border border-dark-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="space-y-1">
          <h1 class="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Welcome, <span class="text-brand-400">{user?.name}</span>
          </h1>
          <p class="text-sm text-slate-400">
            Improve your algorithms skills. Powered by automated debugging feedback.
          </p>
        </div>
        <div class="flex gap-2">
          <button 
            onClick={fetchDashboardData}
            class="flex items-center gap-1.5 rounded-lg border border-dark-800 bg-dark-900/60 p-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw class="h-3.5 w-3.5" /> Refresh List
          </button>
        </div>
      </div>

      {/* Main Grid: Left Problems lists, Right Leaderboard */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow items-start">
        
        {/* Left 2 Columns: Problems Database */}
        <div class="lg:col-span-2 space-y-6">
          
          {/* Filters Bar */}
          <div class="glass-panel p-4 rounded-xl border border-dark-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div class="relative w-full md:w-72">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search problems by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                class="w-full bg-dark-900 border border-dark-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Selector Filters */}
            <div class="flex gap-3 w-full md:w-auto">
              
              {/* Difficulty selector */}
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                class="w-full md:w-36 bg-dark-900 border border-dark-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Tag Selector */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                class="w-full md:w-36 bg-dark-900 border border-dark-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="">All Category Tags</option>
                {tags.map((tag, idx) => (
                  <option key={idx} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div class="glass-panel rounded-xl border border-dark-800/80 overflow-hidden">
            {loading ? (
              <div class="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 class="h-10 w-10 text-brand-500 animate-spin" />
                <span class="text-sm text-slate-400 font-medium animate-pulse">Loading coding workspace catalog...</span>
              </div>
            ) : problems.length === 0 ? (
              <div class="flex flex-col items-center justify-center py-20 text-slate-500">
                <span>No problems found matching filters.</span>
              </div>
            ) : (
              <table class="w-full border-collapse text-left text-xs">
                <thead class="bg-dark-950/80 border-b border-dark-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th class="px-6 py-4">Status</th>
                    <th class="px-6 py-4">Problem Name</th>
                    <th class="px-6 py-4">Tags</th>
                    <th class="px-6 py-4">Difficulty</th>
                    <th class="px-6 py-4">Acceptance</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-dark-800/40 bg-dark-900/10">
                  {problems.map((prob) => {
                    const isSolved = user?.solvedProblems?.includes(prob._id);
                    return (
                      <tr key={prob._id} class="hover:bg-dark-900/40 transition-colors group">
                        
                        {/* Status Checkbox */}
                        <td class="px-6 py-4">
                          {isSolved ? (
                            <CheckCircle class="h-4.5 w-4.5 text-emerald-400" />
                          ) : (
                            <div class="h-4.5 w-4.5 rounded-full border border-dark-700" />
                          )}
                        </td>

                        {/* Title (linked to Playground workspace) */}
                        <td class="px-6 py-4 font-semibold text-slate-200 group-hover:text-brand-400 transition-colors">
                          <Link to={`/problems/${prob.slug}`} class="flex items-center gap-1">
                            <span>{prob.title}</span>
                            <ArrowRight class="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </Link>
                        </td>

                        {/* Tags */}
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-1.5 flex-wrap">
                            {prob.categoryTags.slice(0, 2).map((tag, i) => (
                              <span key={i} class="rounded bg-dark-800/80 px-2 py-0.5 text-3xs font-medium text-slate-400 border border-dark-700/50">
                                {tag}
                              </span>
                            ))}
                            {prob.categoryTags.length > 2 && (
                              <span class="text-3xs text-slate-500">+{prob.categoryTags.length - 2}</span>
                            )}
                          </div>
                        </td>

                        {/* Difficulty */}
                        <td class="px-6 py-4">
                          <span class={`rounded-full border px-2.5 py-0.5 text-3xs font-extrabold ${getDifficultyColor(prob.difficulty)}`}>
                            {prob.difficulty}
                          </span>
                        </td>

                        {/* Acceptance Rate */}
                        <td class="px-6 py-4 font-medium text-slate-400">
                          {prob.acceptanceRate ? `${prob.acceptanceRate}%` : 'N/A'}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>

        {/* Right 1 Column: Global Leaderboards */}
        <div class="space-y-6">
          <div class="glass-panel p-5 rounded-xl border border-dark-800/80 space-y-4">
            <div class="flex items-center gap-2 border-b border-dark-800 pb-3 justify-between">
              <div class="flex items-center gap-2">
                <Trophy class="h-5 w-5 text-amber-400" />
                <span class="text-sm font-bold text-slate-200">Global Leaderboard</span>
              </div>
              <span class="text-3xs text-slate-500 font-mono">Top Solvers</span>
            </div>

            {loading ? (
              <div class="flex justify-center py-10">
                <Loader2 class="h-6 w-6 text-brand-500 animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div class="text-center text-slate-500 py-6 text-xs">No ranks recorded yet.</div>
            ) : (
              <div class="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {leaderboard.map((item) => (
                  <div
                    key={item.rank}
                    class={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition-all ${
                      item.isCurrentUser
                        ? 'border-brand-500/30 bg-brand-500/10'
                        : 'border-dark-800 bg-dark-900/30 hover:border-slate-800'
                    }`}
                  >
                    <div class="flex items-center gap-3">
                      {/* Rank badge */}
                      <span class={`flex h-5 w-5 items-center justify-center rounded font-mono font-bold text-2xs ${
                        item.rank === 1 ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
                        item.rank === 2 ? 'bg-slate-300/10 border border-slate-300/30 text-slate-300' :
                        item.rank === 3 ? 'bg-yellow-700/10 border border-yellow-700/30 text-yellow-600' :
                        'text-slate-500'
                      }`}>
                        {item.rank}
                      </span>
                      {/* User Info */}
                      <div class="flex flex-col">
                        <span class={`font-bold ${item.isCurrentUser ? 'text-brand-400' : 'text-slate-200'}`}>
                          {item.name}
                        </span>
                        <span class="text-3xs text-slate-500">{item.solvedCount} problems solved</span>
                      </div>
                    </div>

                    {/* XP Score */}
                    <span class="font-bold text-slate-300 font-mono">{item.points} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
