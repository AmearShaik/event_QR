import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ClipboardList, Download, RefreshCw, ChevronLeft, ChevronRight, UserCheck } from '../components/Icons';

export const AdminAttendance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<{ total: number; totalPages: number }>({ total: 0, totalPages: 1 });

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAttendanceLogs({ page: page.toString(), limit: '30' });
      setRecords(res.records);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page]);

  const handleExportCSV = async () => {
    try {
      const res = await api.exportAttendanceCSV();
      const url = window.URL.createObjectURL(res.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export CSV report: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-emerald-400" />
            Entrance Attendance Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of candidate entrance check-ins verified at gate scanners.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAttendance}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            Export CSV Audit Log
          </button>
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            Loading entrance attendance audit logs...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-400 text-xs">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Candidate Name</th>
                  <th className="py-3.5 px-4">Program</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Scanned By</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No entrance attendance records logged yet. Begin scanning candidate QR passes at gate scanners.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {new Date(r.scannedAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {r.candidate?.studentId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-300">
                        {r.candidate?.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{r.candidate?.program}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{r.event?.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {r.scannedBy ? r.scannedBy.name : 'System Gateway'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <UserCheck className="w-3.5 h-3.5" /> ENTRY VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-slate-900/60 border-t border-slate-700 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Total Attendance Records: <strong className="text-white">{pagination.total}</strong> | Page {page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
