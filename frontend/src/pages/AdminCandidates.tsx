import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Users } from '../components/Icons';

export const AdminCandidates: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [program, setProgram] = useState<string>(searchParams.get('program') || '');
  const [paymentStatus, setPaymentStatus] = useState<string>(searchParams.get('paymentStatus') || '');
  const [eligibility, setEligibility] = useState<string>(searchParams.get('eligibility') || '');
  const [attendance, setAttendance] = useState<string>(searchParams.get('attendance') || '');
  const [qrGenerated, setQrGenerated] = useState<string>(searchParams.get('qrGenerated') || '');
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));
  const [pagination, setPagination] = useState<{ total: number; totalPages: number }>({ total: 0, totalPages: 1 });

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '30',
      };
      if (search) params.search = search;
      if (program) params.program = program;
      if (paymentStatus) params.paymentStatus = paymentStatus;
      if (eligibility) params.eligibility = eligibility;
      if (attendance) params.attendance = attendance;
      if (qrGenerated) params.qrGenerated = qrGenerated;

      const res = await api.getCandidates(params);
      setCandidates(res.candidates);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch candidate list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [page, search, program, paymentStatus, eligibility, attendance, qrGenerated]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            Candidate Master Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect official candidates, eligibility, and entrance check-in records.
          </p>
        </div>
        <button
          onClick={fetchCandidates}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          Refresh
        </button>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shadow-lg">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Clear other filters so search applies globally across all data
              setProgram('');
              setPaymentStatus('');
              setEligibility('');
              setAttendance('');
              setQrGenerated('');
              setPage(1);
            }}
            placeholder="Search ID, Name, Program..."
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">All Payment Statuses</option>
          <option value="PAID">PAID</option>
          <option value="NOT_PAID">NOT PAID</option>
          <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
        </select>

        <select
          value={eligibility}
          onChange={(e) => {
            setEligibility(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">All Eligibility States</option>
          <option value="true">ELIGIBLE Only</option>
          <option value="false">NOT ELIGIBLE Only</option>
        </select>

        <select
          value={attendance}
          onChange={(e) => {
            setAttendance(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">All Attendance Statuses</option>
          <option value="true">Attended</option>
          <option value="false">Not Attended</option>
        </select>

        <select
          value={qrGenerated}
          onChange={(e) => {
            setQrGenerated(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">All QR Statuses</option>
          <option value="true">QR Generated</option>
          <option value="false">No QR</option>
        </select>

        <button
          onClick={() => {
            setSearch('');
            setProgram('');
            setPaymentStatus('');
            setEligibility('');
            setAttendance('');
            setQrGenerated('');
            setPage(1);
          }}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" /> Clear Filters
        </button>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            Loading candidates database...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-400 text-xs">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Candidate Name</th>
                  <th className="py-3.5 px-4">Program</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Eligibility</th>
                  <th className="py-3.5 px-4">QR Token</th>
                  <th className="py-3.5 px-4">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No candidate records found matching current search filters.
                    </td>
                  </tr>
                ) : (
                  candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{c.studentId}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.program}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.normalizedPaymentStatus} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.eligibilityStatus ? 'ELIGIBLE' : 'NOT_ELIGIBLE'} />
                      </td>
                      <td className="py-3.5 px-4">
                        {c.qrGenerated ? (
                          <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Active QR
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">No QR</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.attended ? (
                          <span className="text-emerald-300 font-bold text-[11px] bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            ✓ Attended
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Not Attended</span>
                        )}
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
            Total Records: <strong className="text-white">{pagination.total}</strong> | Page {page} of {pagination.totalPages}
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
