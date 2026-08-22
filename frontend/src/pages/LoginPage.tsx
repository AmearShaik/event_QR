import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  Lock,
  AlertCircle,
  QrCode,
  KeyRound,
  Eye,
  EyeOff,
} from '../components/Icons';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'ADMIN'>('STUDENT');

  // Student State
  const [studentId, setStudentId] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [showStudentPassword, setShowStudentPassword] = useState<boolean>(false);
  const [studentLoading, setStudentLoading] = useState<boolean>(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Admin State
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const { loginStudent, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    setStudentLoading(true);
    setStudentError(null);
    const effectivePassword = studentPassword.trim() || studentId.trim();
    try {
      const res = await api.studentLogin(studentId.trim(), effectivePassword);
      if (res.status === 'NOT_FOUND') {
        setStudentError(res.error || 'Student record not found in official graduation list.');
        return;
      }
      loginStudent(res);
      navigate('/pass');
    } catch (err: any) {
      setStudentError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) return;
    setAdminLoading(true);
    setAdminError(null);
    try {
      const res = await api.login(adminUsername.trim(), adminPassword.trim());
      loginAdmin(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setAdminError(err.message || 'Invalid administrator username or password.');
    } finally {
      setAdminLoading(false);
    }
  };

  const isNetworkError = (msg: string | null) => {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    return lower.includes('cannot reach') || lower.includes('cannot connect') || lower.includes('failed to fetch') || lower.includes('network') || lower.includes('server url');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row relative overflow-hidden bg-slate-950">

      {/* ══════════════════════════════════════════════
          LEFT PANEL — College Building Background
      ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative flex-col justify-between overflow-hidden"
        style={{
          backgroundImage: `url('/college-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Multi-layer overlay for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-emerald-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

        {/* Decorative grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top spacer */}
        <div className="relative z-10 p-8 xl:p-12" />

        {/* Center college branding */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 xl:px-16 py-12 space-y-6">

          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              MVSR Engineering<br />College
            </h2>
            <p className="text-emerald-300 font-semibold text-base xl:text-lg">
              Hyderabad · Established 1981
            </p>
            <p className="text-slate-300/80 text-sm xl:text-base max-w-sm mx-auto leading-relaxed italic">
              "Technology Traverses Terrestria"
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 xl:gap-10 pt-4">
            {[
              { value: '40+', label: 'Years of Excellence' },
              { value: '1000+', label: 'Graduates' },
              { value: '2026', label: 'Batch' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl xl:text-3xl font-black text-emerald-400">{stat.value}</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom watermark */}
        <div className="relative z-10 p-8 xl:p-12">
          <p className="text-xs text-slate-500 font-medium">
            QR-Based Gate Pass & Attendance System · Secure · Real-time
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE BACKGROUND — subtle building image
      ══════════════════════════════════════════════ */}
      <div
        className="lg:hidden absolute inset-0"
        style={{
          backgroundImage: `url('/college-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-slate-950/95" />
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════════════ */}
      <div className="relative z-10 flex-1 lg:w-[45%] xl:w-[40%] flex flex-col items-center justify-center p-5 sm:p-8 lg:p-10 lg:bg-slate-950/60 lg:backdrop-blur-sm">

        {/* Unified heading above card */}
        <div className="w-full max-w-md mb-6 lg:text-left text-center">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In to Continue</h2>
          <p className="text-slate-400 text-sm mt-1">Access your gate pass or admin dashboard</p>
        </div>

        {/* ── Login Card ── */}
        <div className="w-full max-w-md">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-3xl shadow-2xl overflow-hidden">

            {/* Tab Selector */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border-b border-slate-800/80">
              <button
                type="button"
                id="tab-student"
                onClick={() => { setActiveTab('STUDENT'); setStudentError(null); }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'STUDENT'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                id="tab-admin"
                onClick={() => { setActiveTab('ADMIN'); setAdminError(null); }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'ADMIN'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            <div className="p-6 sm:p-7 space-y-5">

              {/* STUDENT LOGIN FORM */}
              {activeTab === 'STUDENT' && (
                <form onSubmit={handleStudentLogin} className="space-y-4 animate-in fade-in duration-200">
                  {/* Info banner */}
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                    <KeyRound className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Tip:</strong> Your Roll Number is both your User ID and Password.</span>
                  </div>

                  {/* Student ID */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Roll Number (User ID)
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="student-id-input"
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. 2451-22-733-001"
                        required
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Password (Roll Number)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="student-password-input"
                        type={showStudentPassword ? 'text' : 'password'}
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder=""
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 pl-10 pr-11 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {studentError && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-rose-200 text-sm mb-0.5">Authentication Failed</p>
                        <p className="leading-relaxed">{studentError}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    id="student-login-btn"
                    type="submit"
                    disabled={studentLoading || !studentId.trim()}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {studentLoading ? (
                      <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>Sign In & Get My QR Pass</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ADMIN LOGIN FORM */}
              {activeTab === 'ADMIN' && (
                <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in duration-200">
                  {/* Info banner */}
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <span><strong>Admin Access:</strong> Restricted to authorized personnel only.</span>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Admin Username / Email
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="admin-username-input"
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder=""
                        required
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="admin-password-input"
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter admin password"
                        required
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 pl-10 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {adminError && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-rose-200 text-sm mb-0.5">Login Failed</p>
                        <p className="leading-relaxed">{adminError}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    id="admin-login-btn"
                    type="submit"
                    disabled={adminLoading || !adminUsername.trim() || !adminPassword.trim()}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {adminLoading ? (
                      <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign In as Administrator</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
