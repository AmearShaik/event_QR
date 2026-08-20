import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  Upload,
  Users,
  QrCode,
  ClipboardList,
  Calendar,
  LogOut,
  LogIn,
  ShieldCheck,
  Server,
  Wifi,
  Power,
  UserCheck,
} from './Icons';
import { ServerConfigModal } from './ServerConfigModal';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, adminUser, studentSession, logout } = useAuth();
  const [showServerModal, setShowServerModal] = useState<boolean>(false);
  const isServerConfigured = api.isCustomServerSet();

  const adminNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Import Data', path: '/import', icon: Upload },
    { label: 'Candidates', path: '/candidates', icon: Users },
    { label: 'QR Scanner', path: '/scanner', icon: QrCode },
    { label: 'Attendance', path: '/attendance', icon: ClipboardList },
    { label: 'Events', path: '/events', icon: Calendar },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHomePath = () => {
    if (role === 'STUDENT') return '/pass';
    if (role === 'ADMIN') return '/dashboard';
    return '/login';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to={getHomePath()} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                    Graduation 2026
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Pass & Gate Attendance System
                  </span>
                </div>
              </Link>
            </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {role === 'ADMIN' && (
              <>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="h-6 w-px bg-slate-800 mx-2" />

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Admin</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <Power className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}

            {role === 'STUDENT' && studentSession && (
              <>
                <Link
                  to="/pass"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === '/pass'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  My QR Pass
                </Link>

                <div className="h-6 w-px bg-slate-800 mx-2" />

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>{studentSession.candidate.studentId}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}

            {/* Server Settings Icon */}
            <div className="h-6 w-px bg-slate-800 mx-1" />
            <button
              onClick={() => setShowServerModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 hover:bg-slate-800/80 transition-all cursor-pointer relative"
              title="Server & Backend Connection Settings"
            >
              <Server className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px]">Server</span>
              {isServerConfigured && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 ring-2 ring-slate-900" />
              )}
            </button>
          </nav>

          {/* Mobile Server Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setShowServerModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors text-xs font-semibold cursor-pointer relative"
              title="Server Connection Settings"
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Server</span>
              {isServerConfigured && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Links (Only shown when authenticated) */}
      {role && (
        <div className="md:hidden border-t border-slate-800 px-2 py-2 flex items-center justify-around overflow-x-auto">
          {role === 'ADMIN' &&
            adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-medium min-w-[55px] text-center ${
                    isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

          {role === 'STUDENT' && (
            <div className="flex items-center justify-between w-full px-4 py-1">
              <Link
                to="/pass"
                className="flex items-center gap-2 text-xs font-bold text-emerald-400"
              >
                <UserCheck className="w-4 h-4" /> My Pass ({studentSession?.candidate?.studentId})
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-400 flex items-center gap-1"
              >
                <Power className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>

    {/* Server Configuration Modal */}
    <ServerConfigModal
      isOpen={showServerModal}
      onClose={() => setShowServerModal(false)}
    />
  </>
  );
};
