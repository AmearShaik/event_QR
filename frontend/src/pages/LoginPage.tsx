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
  Eye,
  EyeOff,
  Users,
  CheckCircle2,
  Calendar,
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
    <div className="min-h-screen bg-[#f8fbff] text-slate-800 font-sans relative overflow-x-hidden pb-12 flex flex-col items-center">
      
      {/* ── Background Dot Patterns (Top-Left & Top-Right) ── */}
      <div 
        className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 opacity-25 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 1.5px)',
          backgroundSize: '18px 18px',
          maskImage: 'radial-gradient(circle at 0% 0%, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at 0% 0%, black 50%, transparent 100%)',
        }}
      />
      <div 
        className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 opacity-25 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 1.5px)',
          backgroundSize: '18px 18px',
          maskImage: 'radial-gradient(circle at 100% 0%, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at 100% 0%, black 50%, transparent 100%)',
        }}
      />

      {/* ── Transparent Campus Background (Fades smoothly into page) ── */}
      <div 
        className="absolute top-28 sm:top-24 left-0 right-0 h-[380px] sm:h-[480px] pointer-events-none z-0 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.85) 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.85) 60%, transparent 100%)',
        }}
      >
        <img 
          src="/college-bg.jpg" 
          alt="Campus Background" 
          className="w-full h-full object-cover object-[center_35%] opacity-40 sm:opacity-50 blur-[0.3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fbff]/60 via-transparent to-[#f8fbff]" />
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 pt-6 sm:pt-8 pb-4 relative z-10 flex flex-col items-center">
        
        {/* ── 1. Top Emblem & Title Header ── */}
        <div className="text-center space-y-1.5 mb-6 sm:mb-8 relative w-full flex flex-col items-center">
          
          {/* Top Floating Icons (Graduation Cap & Diploma Scroll) */}
          <div className="absolute left-4 sm:left-12 top-2 hidden sm:block pointer-events-none">
            <svg className="w-12 h-12 text-blue-600 drop-shadow-md transform -rotate-12 opacity-90" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <div className="absolute right-4 sm:right-12 top-2 hidden sm:block pointer-events-none">
            <svg className="w-11 h-11 text-blue-500 drop-shadow-md transform rotate-12 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="9" r="3" fill="currentColor" fillOpacity="0.2"/>
            </svg>
          </div>

          {/* Circular College Emblem */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md border border-slate-100 p-1 mb-1 ring-4 ring-blue-500/10">
            <img 
              src="/mvsr-logo.png" 
              alt="College Emblem" 
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="text-blue-600 font-black text-2xl">🎓</span>`;
              }}
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Graduation Day <span className="text-blue-600 font-extrabold">2026</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide">
            Gate Pass System
          </p>

          {/* Diamond Separator & Institutions */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="h-[1px] w-6 sm:w-10 bg-slate-300" />
            <span className="w-1.5 h-1.5 bg-blue-600 rotate-45 transform" />
            <div className="h-[1px] w-6 sm:w-10 bg-slate-300" />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-700 pt-0.5">
            <span>MVSR Engineering College</span>
            <span className="text-slate-300 font-normal">|</span>
            <span>Matrusri Engineering College</span>
          </div>
        </div>

        {/* ── 2. Floating 4 Stat Cards Row (Over transparent campus) ── */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10 px-1 sm:px-4">
          
          {/* Card 1: 40+ Years */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-blue-900/5 border border-slate-100 flex flex-col items-center text-center space-y-1 hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mb-1 shadow-sm shadow-blue-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-blue-600 font-mono tracking-tight">40+</span>
            <span className="text-[11px] font-medium text-slate-600 leading-tight">Years of<br />Excellence</span>
            <div className="w-7 h-1 bg-blue-600 rounded-full mt-2" />
          </div>

          {/* Card 2: 2000+ Students */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-purple-900/5 border border-slate-100 flex flex-col items-center text-center space-y-1 hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center mb-1 shadow-sm shadow-purple-500/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-purple-600 font-mono tracking-tight">2000+</span>
            <span className="text-[11px] font-medium text-slate-600 leading-tight">Students Graduates<br />Every Year</span>
            <div className="w-7 h-1 bg-purple-600 rounded-full mt-2" />
          </div>

          {/* Card 3: 500+ Faculty */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-emerald-900/5 border border-slate-100 flex flex-col items-center text-center space-y-1 hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 shadow-sm shadow-emerald-500/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight">500+</span>
            <span className="text-[11px] font-medium text-slate-600 leading-tight">Faculty<br />Members</span>
            <div className="w-7 h-1 bg-emerald-600 rounded-full mt-2" />
          </div>

          {/* Card 4: 2026 Batch */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-orange-900/5 border border-slate-100 flex flex-col items-center text-center space-y-1 hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center mb-1 shadow-sm shadow-orange-500/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-orange-600 font-mono tracking-tight">2026</span>
            <span className="text-[11px] font-medium text-slate-600 leading-tight">Graduation<br />Batch</span>
            <div className="w-7 h-1 bg-orange-500 rounded-full mt-2" />
          </div>

        </div>

        {/* ── 3. Main Login Card ── */}
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-blue-900/10 border border-slate-100/90 p-6 sm:p-8 space-y-5 relative">
          
          {/* Card Header: Welcome Avatar & Shield */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Welcome!</h2>
                <p className="text-xs text-slate-500 font-medium">Sign in to continue</p>
              </div>
            </div>

            {/* Sparkly Security Shield Badge */}
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              {/* Sparkle dots */}
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-75" />
              <span className="absolute -bottom-1 -left-1 w-1 h-1 bg-blue-300 rounded-full" />
            </div>
          </div>

          {/* Segmented Pill Tabs (Student vs Admin) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              id="tab-student"
              onClick={() => { setActiveTab('STUDENT'); setStudentError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'STUDENT'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            
            <button
              type="button"
              id="tab-admin"
              onClick={() => { setActiveTab('ADMIN'); setAdminError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {/* ── STUDENT LOGIN FORM ── */}
          {activeTab === 'STUDENT' && (
            <form onSubmit={handleStudentLogin} className="space-y-4 animate-in fade-in duration-200">
              
              {/* Tip Box with Lightbulb */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-900 text-xs font-medium">
                <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                  <path d="M9 18h6M10 22h4" />
                </svg>
                <span><strong>Tip:</strong> Your Roll Number is both your User ID and Password.</span>
              </div>

              {/* Student Roll Number Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  ROLL NUMBER (USER ID)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Student Password Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  PASSWORD (ROLL NUMBER)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="student-password-input"
                    type={showStudentPassword ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Enter your roll number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-11 text-slate-900 placeholder-slate-400 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {studentError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{studentError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="student-login-btn"
                type="submit"
                disabled={studentLoading || !studentId.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
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
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in duration-200">
              
              {/* Info banner */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-900 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Admin Portal:</strong> Restricted to authorized ceremony staff.</span>
              </div>

              {/* Admin Username */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Admin Username / Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-password-input"
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-11 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {adminError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{adminError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="admin-login-btn"
                type="submit"
                disabled={adminLoading || !adminUsername.trim() || !adminPassword.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
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

        {/* ── 4. Bottom Feature Bar (Secure, Reliable, Seamless) ── */}
        <div className="w-full max-w-lg bg-white/95 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-4 mt-6 grid grid-cols-3 gap-2 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:px-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Secure</h4>
              <p className="text-[10px] text-slate-500">Your data is protected</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:px-2 border-x border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Reliable</h4>
              <p className="text-[10px] text-slate-500">Always available</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:px-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Seamless</h4>
              <p className="text-[10px] text-slate-500">Fast & easy access</p>
            </div>
          </div>

        </div>

        {/* ── 5. Bottom Footer ── */}
        <div className="mt-8 text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5">
          <span>Celebrating Achievements. Building Futures.</span>
          <span className="text-blue-600">🎓</span>
        </div>

      </div>
    </div>
  );
};
