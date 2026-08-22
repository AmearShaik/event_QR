import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  AlertCircle,
  QrCode,
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
      setAdminError(err.message || 'Invalid administrator credentials.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-800 font-sans relative overflow-x-hidden py-4 sm:py-8 flex flex-col items-center justify-center">
      
      {/* ── Background Dot Patterns (Top-Left & Top-Right) ── */}
      <div 
        className="absolute top-0 left-0 w-36 sm:w-72 h-36 sm:h-72 opacity-25 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
        }}
      />
      <div 
        className="absolute top-0 right-0 w-36 sm:w-72 h-36 sm:h-72 opacity-25 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* ── Natural Transparent Campus Background (No heavy white fog) ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/college-bg.jpg" 
          alt="Campus Background" 
          className="w-full h-full object-cover object-center opacity-30"
        />
      </div>

      <div className="w-full max-w-xl mx-auto px-3.5 sm:px-6 relative z-10 flex flex-col items-center">
        
        {/* ── 1. Top Header & Title ── */}
        <div className="text-center space-y-1.5 mb-5 sm:mb-7 relative w-full flex flex-col items-center">
          
          {/* Decorative Floating Icons on Desktop */}
          <div className="absolute left-0 sm:left-4 top-1 hidden md:block pointer-events-none">
            <svg className="w-11 h-11 text-blue-600 drop-shadow transform -rotate-12 opacity-90" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <div className="absolute right-0 sm:right-4 top-1 hidden md:block pointer-events-none">
            <svg className="w-11 h-11 text-blue-500 drop-shadow transform rotate-12 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="9" r="3" fill="currentColor" fillOpacity="0.2"/>
            </svg>
          </div>

          {/* Circular College Emblem */}
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-md border border-slate-100 p-1 mb-1 ring-4 ring-blue-500/15">
            <img 
              src="/mvsr-logo.png" 
              alt="College Emblem" 
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="text-blue-600 font-black text-xl">🎓</span>`;
              }}
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Graduation Day <span className="text-blue-600 font-extrabold">2026</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Gate Pass System
          </p>

          {/* Diamond Separator */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="h-[1.5px] w-8 sm:w-12 bg-slate-300" />
            <span className="w-2 h-2 bg-blue-600 rotate-45 transform" />
            <div className="h-[1.5px] w-8 sm:w-12 bg-slate-300" />
          </div>

          {/* PROMINENT LARGE COLLEGE NAMES */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-base sm:text-xl md:text-2xl font-extrabold text-slate-900 pt-1 text-center">
            <span className="tracking-tight text-slate-900">MVSR Engineering College</span>
            <span className="text-blue-500 font-bold hidden sm:inline px-1">|</span>
            <span className="tracking-tight text-slate-900">Matrusri Engineering College</span>
          </div>
        </div>

        {/* ── 2. Main Login Card ── */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-950/10 border border-slate-100 p-4 sm:p-7 space-y-4 sm:space-y-5">
          
          {/* Card Header: Welcome Avatar & Shield */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">Welcome!</h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Sign in to continue</p>
              </div>
            </div>

            {/* Sparkly Security Shield Badge */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-75" />
            </div>
          </div>

          {/* Segmented Pill Tabs (Student vs Admin) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl sm:rounded-2xl border border-slate-200/60">
            <button
              type="button"
              id="tab-student"
              onClick={() => { setActiveTab('STUDENT'); setStudentError(null); }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'STUDENT'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Student</span>
            </button>
            
            <button
              type="button"
              id="tab-admin"
              onClick={() => { setActiveTab('ADMIN'); setAdminError(null); }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin</span>
            </button>
          </div>

          {/* ── STUDENT LOGIN FORM ── */}
          {activeTab === 'STUDENT' && (
            <form onSubmit={handleStudentLogin} className="space-y-3.5 sm:space-y-4 animate-in fade-in duration-200">
              
              {/* Tip Box with Lightbulb */}
              <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-blue-50/90 border border-blue-100 text-blue-900 text-[11px] sm:text-xs font-medium leading-snug">
                <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                  <path d="M9 18h6M10 22h4" />
                </svg>
                <span><strong>Tip:</strong> Your Roll Number is both your User ID and Password.</span>
              </div>

              {/* Student Roll Number Input */}
              <div className="space-y-1">
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  ROLL NUMBER (USER ID)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    id="student-id-input"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 2451-22-733-001 or 1608-22-732-002"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Student Password Input */}
              <div className="space-y-1">
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  PASSWORD (ROLL NUMBER)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="student-password-input"
                    type={showStudentPassword ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Enter your roll number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-10 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {studentError && (
                <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-medium leading-relaxed animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p>{studentError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="student-login-btn"
                type="submit"
                disabled={studentLoading || !studentId.trim()}
                className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {studentLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Sign In & Get My QR Pass</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── ADMIN LOGIN FORM ── */}
          {activeTab === 'ADMIN' && (
            <form onSubmit={handleAdminLogin} className="space-y-3.5 sm:space-y-4 animate-in fade-in duration-200">
              
              {/* Info banner */}
              <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-blue-50/90 border border-blue-100 text-blue-900 text-[11px] sm:text-xs font-medium leading-snug">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Admin Portal:</strong> Restricted to authorized ceremony staff.</span>
              </div>

              {/* Admin Username */}
              <div className="space-y-1">
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Admin Username / Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    id="admin-username-input"
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin@graduation.edu"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div className="space-y-1">
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-password-input"
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-10 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {adminError && (
                <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-medium leading-relaxed animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p>{adminError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="admin-login-btn"
                type="submit"
                disabled={adminLoading || !adminUsername.trim() || !adminPassword.trim()}
                className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {adminLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
  );
};
