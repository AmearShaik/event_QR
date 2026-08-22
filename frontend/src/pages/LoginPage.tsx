import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, isNativePlatform, getApiBaseUrl } from '../services/api';
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
  Server,
  Wifi,
} from '../components/Icons';
import { ServerConfigModal } from '../components/ServerConfigModal';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [isServerModalOpen, setIsServerModalOpen] = useState<boolean>(false);

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
      setStudentError(err.message || 'Authentication failed. Please check your credentials or server connection.');
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
      setAdminError(err.message || 'Invalid administrator credentials or cannot reach server.');
    } finally {
      setAdminLoading(false);
    }
  };

  const isNetworkError = (msg: string | null) => {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    return (
      lower.includes('cannot reach') ||
      lower.includes('cannot connect') ||
      lower.includes('failed to fetch') ||
      lower.includes('network') ||
      lower.includes('server url') ||
      lower.includes('connection')
    );
  };

  const isMobile = isNativePlatform();
  const activeBaseUrl = getApiBaseUrl();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row relative bg-slate-950 text-slate-100 overflow-x-hidden">

      {/* ══════════════════════════════════════════════
          1. MOBILE TOP HERO (Half Background on Mobile)
      ══════════════════════════════════════════════ */}
      <div
        className="lg:hidden relative w-full h-[38vh] min-h-[250px] max-h-[340px] flex flex-col justify-between p-5 overflow-hidden"
        style={{
          backgroundImage: `url('/college-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/60 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/60 via-transparent to-slate-950/80" />

        {/* Top bar on mobile with Server status button */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Graduation Day 2026
          </span>

          <button
            type="button"
            onClick={() => setIsServerModalOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server IP</span>
          </button>
        </div>

        {/* Hero Branding Content */}
        <div className="relative z-10 text-center space-y-1.5 my-auto pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            MVSR Engineering College
          </h1>
          <p className="text-emerald-400 font-semibold text-xs sm:text-sm">
            Hyderabad · Established 1981
          </p>
          <p className="text-slate-300/80 text-[11px] sm:text-xs italic max-w-xs mx-auto">
            "Technology Traverses Terrestria"
          </p>

          {/* Quick Stats on Mobile */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <div>
              <div className="text-base font-black text-emerald-400 leading-none">40+</div>
              <div className="text-[10px] text-slate-300 font-medium">Years</div>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div>
              <div className="text-base font-black text-emerald-400 leading-none">1000+</div>
              <div className="text-[10px] text-slate-300 font-medium">Graduates</div>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div>
              <div className="text-base font-black text-emerald-400 leading-none">2026</div>
              <div className="text-[10px] text-slate-300 font-medium">Batch</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          2. DESKTOP LEFT PANEL (Side-by-Side View)
      ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col justify-between overflow-hidden"
        style={{
          backgroundImage: `url('/college-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-emerald-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 p-8 xl:p-12 flex justify-between items-center">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MVSR Engineering College · Graduation Day 2026
          </span>

          <button
            type="button"
            onClick={() => setIsServerModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 backdrop-blur-md shadow-lg transition-all cursor-pointer"
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Server: {activeBaseUrl.replace('/api', '')}</span>
          </button>
        </div>

        {/* Center branding */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 xl:px-16 py-12 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
              MVSR Engineering<br />College
            </h2>
            <p className="text-emerald-300 font-semibold text-base xl:text-lg">
              Hyderabad · Established 1981
            </p>
            <p className="text-slate-300/90 text-sm xl:text-base max-w-md mx-auto leading-relaxed italic">
              "Technology Traverses Terrestria"
            </p>
          </div>

          <div className="flex items-center gap-8 xl:gap-12 pt-4">
            {[
              { value: '40+', label: 'Years of Excellence' },
              { value: '1000+', label: 'Graduates' },
              { value: '2026', label: 'Batch' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl xl:text-4xl font-black text-emerald-400">{stat.value}</div>
                <div className="text-xs text-slate-300 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom watermark */}
        <div className="relative z-10 p-8 xl:p-12">
          <p className="text-xs text-slate-400 font-medium">
            QR-Based Gate Pass & Attendance Verification System · Secure & Real-time
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          3. LOGIN FORM SECTION (Overlapping on Mobile)
      ══════════════════════════════════════════════ */}
      <div className="relative z-20 flex-1 lg:w-[45%] xl:w-[42%] flex flex-col items-center justify-center -mt-8 sm:-mt-10 lg:mt-0 px-4 sm:px-8 py-6 lg:p-12 lg:bg-slate-950/70 lg:backdrop-blur-md">

        {/* Heading above card */}
        <div className="w-full max-w-md mb-4 sm:mb-6 text-center lg:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Sign In to Continue
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Access your gate pass or admin dashboard
          </p>
        </div>

        {/* ── Login Card ── */}
        <div className="w-full max-w-md">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">

            {/* Tab Selector */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-950/90 border-b border-slate-800">
              <button
                type="button"
                id="tab-student"
                onClick={() => { setActiveTab('STUDENT'); setStudentError(null); }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
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
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'ADMIN'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            <div className="p-5 sm:p-7 space-y-5">

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
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
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
                        placeholder="Optional (defaults to Roll No)"
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl py-3 pl-10 pr-11 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
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

                  {/* Error Alert with Server Configuration button if connection fails */}
                  {studentError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-200 text-sm mb-0.5">Authentication Failed</p>
                          <p className="leading-relaxed">{studentError}</p>
                        </div>
                      </div>

                      {isNetworkError(studentError) && (
                        <button
                          type="button"
                          onClick={() => setIsServerModalOpen(true)}
                          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Server className="w-3.5 h-3.5" />
                          <span>Configure Host Server IP (e.g. 10.213.207.38)</span>
                        </button>
                      )}
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
                        placeholder="admin@graduation.edu"
                        required
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
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
                        placeholder="admin@2026"
                        required
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl py-3 pl-10 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
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
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-200 text-sm mb-0.5">Login Failed</p>
                          <p className="leading-relaxed">{adminError}</p>
                        </div>
                      </div>

                      {isNetworkError(adminError) && (
                        <button
                          type="button"
                          onClick={() => setIsServerModalOpen(true)}
                          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Server className="w-3.5 h-3.5" />
                          <span>Configure Host Server IP</span>
                        </button>
                      )}
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

          {/* Quick Server connection footer button on mobile */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsServerModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-300 transition-colors py-1 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Server Connection: <span className="font-mono text-slate-300">{activeBaseUrl.replace('/api', '')}</span></span>
            </button>
          </div>
        </div>
      </div>

      {/* Server Config Modal */}
      <ServerConfigModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
      />
    </div>
  );
};

