import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Loader2, Award, ChevronUp, Clock, Database, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PerformanceChart = ({ problemId, submitTriggerCount }) => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchPerformanceData = async () => {
    if (!problemId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/performance/${problemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.history || []);
        setStats(resData.communityStats);
      }
    } catch (err) {
      console.error('Error fetching performance analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [problemId, submitTriggerCount]);

  const bestRuntime = data.length > 0 ? Math.min(...data.map(d => d.runtime)) : 0;
  const lastAttempt = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div class="flex flex-col h-full bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
      
      {/* Title Header */}
      <div class="flex h-12 items-center justify-between bg-dark-950 px-4 border-b border-dark-800">
        <div class="flex items-center gap-2">
          <Clock class="h-4.5 w-4.5 text-brand-400" />
          <span class="text-xs font-bold text-slate-200">Algorithmic Efficiency Analytics</span>
        </div>
      </div>

      {/* Content Area */}
      <div class="flex-grow p-4 overflow-y-auto space-y-4 text-xs font-sans">
        
        {loading && (
          <div class="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 class="h-8 w-8 text-brand-500 animate-spin" />
            <span class="text-slate-400">Loading metrics...</span>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div class="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-dark-950 border border-dark-800">
              <Database class="h-6 w-6 text-slate-500" />
            </div>
            <div class="space-y-1 px-4">
              <div class="font-bold text-slate-200">No submission history yet</div>
              <p class="text-slate-400 leading-relaxed max-w-xs text-xs">
                To plot your algorithmic optimization curve, successfully submit an Accepted solution to this problem first.
              </p>
            </div>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div class="space-y-4 animate-fade-in">
            
            {/* Stats Dashboard Row */}
            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-lg border border-dark-800 bg-dark-950/40 p-2.5 space-y-1">
                <span class="text-3xs text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Clock class="h-3 w-3 text-brand-400" /> Best Speed
                </span>
                <div class="text-sm font-extrabold text-slate-200 font-mono">
                  {bestRuntime} <span class="text-3xs text-slate-500 font-normal">ms</span>
                </div>
              </div>

              <div class="rounded-lg border border-dark-800 bg-dark-950/40 p-2.5 space-y-1">
                <span class="text-3xs text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Database class="h-3 w-3 text-indigo-400" /> Space Profile
                </span>
                <div class="text-sm font-extrabold text-slate-200 font-mono">
                  {lastAttempt ? lastAttempt.memory : 0} <span class="text-3xs text-slate-500 font-normal">MB</span>
                </div>
              </div>

              <div class="rounded-lg border border-dark-800 bg-dark-950/40 p-2.5 space-y-1">
                <span class="text-3xs text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Award class="h-3 w-3 text-emerald-400" /> Avg Community
                </span>
                <div class="text-sm font-extrabold text-slate-200 font-mono">
                  {stats ? stats.averageRuntime : 0} <span class="text-3xs text-slate-500 font-normal">ms</span>
                </div>
              </div>
            </div>

            {/* Performance curve chart */}
            <div class="space-y-1">
              <span class="text-3xs text-slate-400 font-semibold uppercase">Runtime Curve (ms)</span>
              <div class="h-44 w-full bg-dark-950/30 border border-dark-800 rounded-lg p-2 font-mono text-3xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRuntime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" stroke="#475569" tickLine={false} />
                    <YAxis stroke="#475569" tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="runtime"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRuntime)"
                      name="Your Code"
                    />
                    <Area
                      type="monotone"
                      dataKey="communityAverage"
                      stroke="#10b981"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      fillOpacity={0}
                      name="Community Avg"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Optimization Checklist */}
            <div class="rounded-lg border border-dark-800/80 bg-dark-950/20 p-3 space-y-1.5 font-sans leading-normal text-slate-400">
              <div class="text-2xs text-slate-200 font-semibold">How to optimize further:</div>
              <ul class="list-disc pl-4 space-y-1 text-3xs">
                <li>Minimize allocations inside your main loop to lower Space Complexity.</li>
                <li>Avoid linear search lookups (\`Array.indexOf\` or \`includes\`) by replacing them with Map/Set lookups for O(1) checks.</li>
                <li>Check logic constraints to determine if pre-allocating size or early returns save execution cycles.</li>
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default PerformanceChart;
