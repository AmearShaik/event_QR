import React, { useState, useEffect } from 'react';
import { QRScanner } from '../components/QRScanner';
import { api } from '../services/api';
import { ScanResponse } from '../types';
import { ShieldCheck, LogIn, GraduationCap, CheckCircle2, AlertTriangle, Filter } from '../components/Icons';

export const AdminScanner: React.FC = () => {
  // Scan mode: 'entry' or 'kit-allocation'
  const [scanMode, setScanMode] = useState<'entry' | 'kit-allocation'>('entry');
  const [scanStats, setScanStats] = useState<{ entryCount: number; kitCount: number }>({
    entryCount: 0,
    kitCount: 0,
  });

  const isEntry = scanMode === 'entry';

  const handleScanResult = async (token: string): Promise<ScanResponse> => {
    const res = await api.scanToken(token, scanMode);
    if (res.status === 'SUCCESS') {
      if (isEntry) {
        setScanStats((prev) => ({ ...prev, entryCount: prev.entryCount + 1 }));
      } else {
        setScanStats((prev) => ({ ...prev, kitCount: prev.kitCount + 1 }));
      }
    }
    return res;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="w-full max-w-xl mx-auto space-y-5">

        {/* Header Title */}
        <div className="text-center space-y-1">
          <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live QR Scanner Checkpoint
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
            {isEntry ? 'Gate Entry & Attendance' : 'Graduation Kit Allocation'}
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isEntry
              ? 'Scans student QR for ceremony hall entrance. Duplicate entries are blocked.'
              : 'Allocates graduation kit & gown. Verified only for Paid students.'}
          </p>
        </div>

        {/* ── Scan Mode Selector (Drop-down & Segmented Toggle) ── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-xl space-y-2">
          <div className="flex items-center justify-between px-2 pt-1">
            <label htmlFor="scanner-mode-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select Scan Checkpoint:</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {isEntry ? 'Mode: GATE ENTRY' : 'Mode: KIT ALLOCATION'}
            </span>
          </div>

          {/* Segmented Buttons */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <button
              type="button"
              id="mode-entry-btn"
              onClick={() => setScanMode('entry')}
              className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isEntry
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>1. Gate Entry</span>
            </button>

            <button
              type="button"
              id="mode-kit-btn"
              onClick={() => setScanMode('kit-allocation')}
              className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !isEntry
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>2. Kit Allocation</span>
            </button>
          </div>

          {/* Quick Dropdown Alternative for rapid selection */}
          <div className="px-1 pt-1">
            <select
              id="scanner-mode-select"
              value={scanMode}
              onChange={(e) => setScanMode(e.target.value as any)}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="entry">🚪 Gate Entry & Hall Attendance (All Eligible Students)</option>
              <option value="kit-allocation">🎓 Graduation Kit & Gown Distribution (Paid Students Only)</option>
            </select>
          </div>
        </div>

        {/* Mode Status Banner */}
        <div
          className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2.5 transition-all ${
            isEntry
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
          }`}
        >
          {isEntry ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Gate Entry Checkpoint:</strong> Scans student pass for attendance. All registered students pass.
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Kit Allocation Checkpoint:</strong> Scanner checks payment status in real-time. Unpaid students are blocked.
              </span>
            </>
          )}
        </div>

        {/* Live Camera Scanner Viewport */}
        <QRScanner
          key={scanMode}
          onScanResult={handleScanResult}
          autoResetDelayMs={2500}
        />

        <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-time database validation · Duplicate rescans automatically rejected.</span>
        </p>

      </div>
    </div>
  );
};
