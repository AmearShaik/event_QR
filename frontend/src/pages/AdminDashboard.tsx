import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import {
  Users,
  CheckCircle2,
  XCircle,
  QrCode,
  TrendingUp,
  RefreshCw,
  Download,
  GraduationCap,
  LogIn,
  Filter,
} from '../components/Icons';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<(DashboardStats & { programBreakdown: any[]; collegeBreakdown?: any[]; availableColleges?: string[] }) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [selectedCollege, setSelectedCollege] = useState<string>('all'); // 'all', 'mvsr', 'matrusri'

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await api.exportAttendanceCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const fetchStats = async (college = selectedCollege) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats(college);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedCollege);
  }, [selectedCollege]);

  if (loading && !stats) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Calculating live graduation statistics...</span>
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

  const entryStats = stats.entryStats || {
    total: stats.attendanceCount || 0,
    paid: stats.attendedPaidCount || 0,
    unpaid: stats.attendedNotPaidCount || 0,
    remaining: stats.remainingEligible || 0,
    percentage: stats.attendanceRate || 0,
  };

  const kitStats = stats.kitStats || {
    total: 0,
    paid: 0,
    unpaid: 0,
    remaining: stats.totalCandidates || 0,
    percentage: 0,
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Graduation Day 2026 Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate statistics, Gate Entry attendance, and Graduation Kit distribution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export CSV Audit
          </button>
          <button
            onClick={() => fetchStats(selectedCollege)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── College Selector Bar ── */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 shadow-xl flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Institution / College Filter:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCollege('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCollege === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            🏛 All Institutions (Combined)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCollege('mvsr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCollege === 'mvsr'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            🎓 MVSR Engineering College (2451-xxxx)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCollege('matrusri')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCollege === 'matrusri'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 shadow-md shadow-teal-500/25 border border-teal-300/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            🏛 Matrusri Engineering College (1608-xxxx)
          </button>
        </div>
      </div>

      {/* Overview Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => navigate(`/candidates${selectedCollege !== 'all' ? `?college=${selectedCollege}` : ''}`)}
          className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2 cursor-pointer hover:bg-slate-700/80 transition-colors shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Candidates</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalCandidates.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 block">
            {selectedCollege === 'all' ? 'All Registered Candidates' : selectedCollege === 'mvsr' ? 'MVSR Candidates' : 'Matrusri Candidates'}
          </span>
        </div>

        <div 
          onClick={() => navigate(`/candidates?paymentStatus=PAID${selectedCollege !== 'all' ? `&college=${selectedCollege}` : ''}`)}
          className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 space-y-2 cursor-pointer hover:bg-slate-700/80 transition-colors shadow-lg"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paid Candidates</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.paidCandidates.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400/80 block">Fee Status: PAID</span>
        </div>

        <div 
          onClick={() => navigate(`/candidates?paymentStatus=NOT_PAID${selectedCollege !== 'all' ? `&college=${selectedCollege}` : ''}`)}
          className="bg-slate-800/80 border border-rose-500/30 rounded-2xl p-4 space-y-2 cursor-pointer hover:bg-slate-700/80 transition-colors shadow-lg"
        >
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unpaid Candidates</span>
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400">{stats.notPaidCandidates.toLocaleString()}</p>
          <span className="text-[10px] text-rose-400/80 block">Fee Status: NOT PAID</span>
        </div>

        <div 
          onClick={() => navigate(`/candidates?qrGenerated=true${selectedCollege !== 'all' ? `&college=${selectedCollege}` : ''}`)}
          className="bg-slate-800/80 border border-indigo-500/30 rounded-2xl p-4 space-y-2 cursor-pointer hover:bg-slate-700/80 transition-colors shadow-lg"
        >
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active QR Passes</span>
            <QrCode className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-300">{stats.qrGeneratedCount.toLocaleString()}</p>
          <span className="text-[10px] text-indigo-400/80 block">Digital Passes Issued</span>
        </div>
      </div>

      {/* ── Checkpoints Live Tracking Cards (Gate Entry vs Kit Allocation) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Gate Entry Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Gate Entry & Hall Attendance
                </h3>
                <p className="text-xs text-slate-400">Ceremony entrance check-ins verified</p>
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {entryStats.percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, entryStats.percentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Entered</span>
              <p className="text-xl font-black text-white">{entryStats.total}</p>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Paid Students</span>
              <p className="text-xl font-black text-emerald-300">{entryStats.paid}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase">Unpaid Students</span>
              <p className="text-xl font-black text-rose-300">{entryStats.unpaid}</p>
            </div>
          </div>
        </div>

        {/* 2. Kit Allocation Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Graduation Kit Allocation
                </h3>
                <p className="text-xs text-slate-400">Gown & graduation kit distribution</p>
              </div>
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {kitStats.percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kitStats.percentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Distributed</span>
              <p className="text-xl font-black text-white">{kitStats.total}</p>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Kits to Paid</span>
              <p className="text-xl font-black text-emerald-300">{kitStats.paid}</p>
            </div>
            <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Kits to Unpaid</span>
              <p className="text-xl font-black text-amber-300">{kitStats.unpaid}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Program Breakdown */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Candidates by Program / Branch ({selectedCollege === 'all' ? 'All Colleges' : selectedCollege === 'mvsr' ? 'MVSR' : 'Matrusri'})
        </h3>
        
        <div className="space-y-3 pt-2">
          {stats.programBreakdown?.map((item) => {
            const pct = Math.round((item.count / maxCount) * 100);
            return (
              <div key={item.program} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{item.program}</span>
                  <span className="text-emerald-400 font-mono">{item.count} Candidates</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700/50">
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
