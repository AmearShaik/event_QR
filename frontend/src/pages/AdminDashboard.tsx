import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import {
  Users,
  CheckCircle2,
  XCircle,
  QrCode,
  UserCheck,
  TrendingUp,
  RefreshCw,
  Award,
} from '../components/Icons';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<(DashboardStats & { programBreakdown: any[] }) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Calculating live dashboard statistics from database master source...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-6 text-sm">
          {error || 'Could not fetch dashboard statistics.'}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...(stats.programBreakdown?.map((p) => p.count) || [1]), 1);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Graduation Day 2026 Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate eligibility, QR distribution, and entrance attendance analytics.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          Refresh Stats
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Candidates</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalCandidates.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 block">Master File Source</span>
        </div>

        <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Eligible</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.eligibleCandidates.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-500/80 block">Payment = PAID</span>
        </div>

        <div className="bg-slate-800/80 border border-rose-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Not Eligible</span>
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400">{stats.notEligibleCandidates.toLocaleString()}</p>
          <span className="text-[10px] text-rose-500/80 block">Not Paid / Partial</span>
        </div>

        <div className="bg-slate-800/80 border border-indigo-500/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">QR Generated</span>
            <QrCode className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-300">{stats.qrGeneratedCount.toLocaleString()}</p>
          <span className="text-[10px] text-indigo-400/80 block">Active QR Tokens</span>
        </div>

        <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Attended</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-300">{stats.attendanceCount.toLocaleString()}</p>
          <span className="text-[10px] text-amber-400/80 block">
            {stats.remainingEligible} Remaining Eligible
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Attendance Completion Rate
            </span>
            <h3 className="text-4xl font-black text-emerald-400">
              {stats.attendanceRate}%
            </h3>
            <p className="text-xs text-slate-400">
              {stats.attendanceCount} of {stats.eligibleCandidates} eligible candidates checked in
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Award className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Payment Category Distribution
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Paid (Eligible)
              </span>
              <span className="font-mono font-bold text-emerald-400">{stats.paidCandidates}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Not Paid
              </span>
              <span className="font-mono font-bold text-rose-400">{stats.notPaidCandidates}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Partially Paid
              </span>
              <span className="font-mono font-bold text-amber-400">{stats.partiallyPaidCandidates}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Gate Scanner Status
            </h4>
            <p className="text-sm font-semibold text-slate-200">
             Active Event: Graduation Day 2026
            </p>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/60 text-xs text-slate-400 space-y-1 mt-4">
            <p className="text-emerald-400 font-bold">✓ Real-time Real-World Scan Security</p>
            <p>Every entrance scan executes fresh payment validation against database records.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Candidates by Program / Course Branch
        </h3>
        
        <div className="space-y-3 pt-2">
          {stats.programBreakdown?.map((item, idx) => {
            const pct = Math.round((item.count / maxCount) * 100);
            return (
              <div key={item.program} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{item.program}</span>
                  <span className="text-emerald-400 font-mono">{item.count} Candidates</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
