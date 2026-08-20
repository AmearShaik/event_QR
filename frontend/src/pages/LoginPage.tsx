import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, getApiBaseUrl, isNativePlatform } from '../services/api';
import {
  GraduationCap,
  ShieldCheck,
  Search,
  Lock,
  AlertCircle,
  Sparkles,
  QrCode,
  KeyRound,
  Server,
  Wifi,
  CheckCircle2,
  Eye,
  EyeOff,
} from '../components/Icons';
import { ServerConfigModal } from '../components/ServerConfigModal';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [showServerModal, setShowServerModal] = useState<boolean>(false);

  // Student State - Initialized completely empty
  const [studentId, setStudentId] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [showStudentPassword, setShowStudentPassword] = useState<boolean>(false);
  const [studentLoading, setStudentLoading] = useState<boolean>(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Admin State - Initialized completely empty
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const { loginStudent, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const isMobileApp = isNativePlatform();
  const isCustomServer = api.isCustomServerSet();
  const currentBase = getApiBaseUrl();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setStudentLoading(true);
    setStudentError(null);

    // If student password field is left empty, use studentId as password (per specification: Roll Number is User ID and Password)
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950">
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Graduation Day 2026 Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Authentication & Gate Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Please log in with your credentials to access your entrance QR pass or administrative controls.
          </p>
        </div>

        {/* Mobile Server Notice Banner (if unconfigured on native app) */}
        {isMobileApp && !isCustomServer && (
          <div
            onClick={() => setShowServerModal(true)}
            className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/15 transition-all shadow-lg animate-in fade-in"
          >
            <div className="flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Mobile App:</strong> Connect to backend (e.g. <code className="text-white">http://192.168.1.19:5000</code>).
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 text-[11px] font-bold shrink-0">
              Setup IP
            </span>
          </div>
        )}

        {/* Glassmorphic Portal Container */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('STUDENT');
                setStudentError(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'STUDENT'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ADMIN');
                setAdminError(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'ADMIN'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>

          {/* STUDENT LOGIN FORM */}
          {activeTab === 'STUDENT' && (
            <form onSubmit={handleStudentLogin} className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-xs text-emerald-300 flex items-center gap-2.5 font-medium">
                <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Student Note:</strong> Your Roll Number is your User ID and Password.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  User ID (Roll Number)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter your Student Roll Number"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Password (Roll Number)
                </label>
                <div className="relative">
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Enter your Password (Roll Number)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-12 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-emerald-400 focus:outline-none transition-colors"
                  >
                    {showStudentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {studentError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-4 text-xs font-medium space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-200 text-sm">Authentication Notice</p>
                      <p className="leading-relaxed">{studentError}</p>
                    </div>
                  </div>
                  {isNetworkError(studentError) && (
                    <button
                      type="button"
                      onClick={() => setShowServerModal(true)}
                      className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-xs border border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Server className="w-3.5 h-3.5" />
                      <span>Configure Backend Server URL</span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={studentLoading || !studentId.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {studentLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    <span>Sign In & Generate Digital Pass</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ADMIN LOGIN FORM */}
          {activeTab === 'ADMIN' && (
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3.5 text-xs text-indigo-300 flex items-center gap-2.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  <strong>Admin Access:</strong> Enter administrative credentials to access entrance control.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Admin Username / Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Enter Admin Username or Email"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <ShieldCheck className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter Admin Password"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-12 text-white placeholder-slate-500 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-emerald-400 focus:outline-none transition-colors"
                  >
                    {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-4 text-xs font-medium space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-200 text-sm">Login Failed</p>
                      <p className="leading-relaxed">{adminError}</p>
                    </div>
                  </div>
                  {isNetworkError(adminError) && (
                    <button
                      type="button"
                      onClick={() => setShowServerModal(true)}
                      className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-xs border border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Server className="w-3.5 h-3.5" />
                      <span>Configure Backend Server URL</span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={adminLoading || !adminUsername.trim() || !adminPassword.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adminLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Sign In as Administrator</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Server Connection Status Footer */}
          <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 truncate max-w-[240px]">
              <span className={`w-2 h-2 rounded-full ${isCustomServer ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span className="truncate text-[11px] font-mono text-slate-400" title={currentBase}>
                {currentBase}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowServerModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 py-1 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 transition-colors cursor-pointer border border-slate-700"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Change Server</span>
            </button>
          </div>
        </div>
      </div>

      <ServerConfigModal
        isOpen={showServerModal}
        onClose={() => setShowServerModal(false)}
      />
    </div>
  );
};
