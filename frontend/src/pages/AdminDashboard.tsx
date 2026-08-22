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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-950">
        <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl shadow-xl">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Calculating live statistics...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-5 text-sm flex items-center justify-between gap-3">
          <span>{error || 'Could not fetch dashboard statistics.'}</span>
          <button
            onClick={() => fetchStats(selectedCollege)}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-xl text-xs font-semibold"
          >
            Retry
          </button>
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

  const collegeLabel =
    selectedCollege === 'all'
      ? 'All Institutions'
      : selectedCollege === 'mvsr'
      ? 'MVSR'
      : 'Matrusri';

  return (
    <div className="max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 text-slate-100">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-emerald-400" />
            <span>Graduation Day 2026 Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate statistics, Gate Entry attendance, and Graduation Kit distribution.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-1.5 sm:gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {exporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => fetchStats(selectedCollege)}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Mobile-Optimized Institution / College Selector ── */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-xl space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">
            Filter by Institution:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCollege('all')}
            className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              selectedCollege === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            🏛 All Institutions ({stats.collegeBreakdown?.reduce((a, b) => a + b.count, 0) || 1385})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCollege('mvsr')}
            className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              selectedCollege === 'mvsr'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            🎓 MVSR (2451-xxxx)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCollege('matrusri')}
            className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              selectedCollege === 'matrusri'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 shadow-md shadow-teal-500/25 border border-teal-300/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            🏛 Matrusri (1608-xxxx)
          </button>
        </div>
      </div>

      {/* ── 4 Top KPI Cards (Responsive 2x2 on mobile, 4 on desktop) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Candidates */}
        <div 
          onClick={() => navigate(`/candidates${selectedCollege !== 'all' ? `?college=${selectedCollege}` : ''}`)}
          className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 space-y-1.5 cursor-pointer hover:bg-slate-700/80 transition-colors shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-white font-mono">{stats.totalCandidates.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 truncate block">
            {collegeLabel} Candidates
          </span>
        </div>

        {/* Paid Candidates */}
        <div 
          onClick={() => navigate(`/candidates?paymentStatus=PAID${selectedCollege !== 'all' ? `&college=${selectedCollege}` : ''}`)}
          className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 space-y-1.5 cursor-pointer hover:bg-slate-700/80 transition-colors shadow-lg"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Paid</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-emerald-400 font-mono">{stats.paidCandidates.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400/80 truncate block">
            {collegeLabel} (PAID)
          </span>
        </div>

        {/* Unpaid Candidates */}
        <div 
          onClick={() => navigate(`/candidates?paymentStatus=NOT_PAID${selectedCollege !== 'all' ? `&college=${selectedCollege}` : ''}`)}
          className="bg-slate-800/80 border border-rose-500/30 rounded-2xl p-3.5 sm:p-4 space-y-1.5 cursor-pointer hover:bg-slate-700/80 transition-colors shadow-lg"
        >
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Unpaid</span>
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-rose-400 font-mono">{stats.notPaidCandidates.toLocaleString()}</p>
          <span className="text-[10px] text-rose-400/80 truncate block">
            {collegeLabel} (NOT PAID)
          </span>
        </div>

        {/* Active QR Passes */}
        <div 
          onClick={() => navigate(`/candidates?qrGenerated=true${selectedCollege !== 'all' ? `&college=${selectedCollege}` : ''}`)}
          className="bg-slate-800/80 border border-indigo-500/30 rounded-2xl p-3.5 sm:p-4 space-y-1.5 cursor-pointer hover:bg-slate-700/80 transition-colors shadow-lg"
        >
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">QR Passes</span>
            <QrCode className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-indigo-300 font-mono">{stats.qrGeneratedCount.toLocaleString()}</p>
          <span className="text-[10px] text-indigo-400/80 truncate block">
            Digital Passes Issued
          </span>
        </div>
      </div>

      {/* ── Checkpoints Live Tracking Cards (Gate Entry vs Kit Allocation) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* 1. Gate Entry Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Gate Entry Attendance
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">Entrance pass scans verified</p>
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono shrink-0">
              {entryStats.percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 sm:h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, entryStats.percentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 sm:p-3 text-center space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Total Entered</span>
              <p className="text-base sm:text-xl font-black text-white font-mono">{entryStats.total}</p>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-2.5 sm:p-3 text-center space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase block">Paid Students</span>
              <p className="text-base sm:text-xl font-black text-emerald-300 font-mono">{entryStats.paid}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 sm:p-3 text-center space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-rose-400 uppercase block">Unpaid Students</span>
              <p className="text-base sm:text-xl font-black text-rose-300 font-mono">{entryStats.unpaid}</p>
            </div>
          </div>
        </div>

        {/* 2. Kit Allocation Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Graduation Kit Allocation
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">Gown & graduation kit distribution</p>
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono shrink-0">
              {kitStats.percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 sm:h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kitStats.percentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 sm:p-3 text-center space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase block">Total Distributed</span>
              <p className="text-base sm:text-xl font-black text-white font-mono">{kitStats.total}</p>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-2.5 sm:p-3 text-center space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase block">Kits to Paid</span>
              <p className="text-base sm:text-xl font-black text-emerald-300 font-mono">{kitStats.paid}</p>
            </div>
            <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-2.5 sm:p-3 text-center space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase block">Kits to Unpaid</span>
              <p className="text-base sm:text-xl font-black text-amber-300 font-mono">{kitStats.unpaid}</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Branch / Program Breakdown ── */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Branch / Program Distribution ({collegeLabel})</span>
        </h3>
        
        <div className="space-y-3 pt-1">
          {stats.programBreakdown?.map((item) => {
            const pct = Math.round((item.count / maxCount) * 100);
            return (
              <div key={item.program} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200 truncate pr-2">{item.program}</span>
                  <span className="text-emerald-400 font-mono shrink-0">{item.count} Candidates</span>
                </div>
                <div className="w-full h-2.5 sm:h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700/50">
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
