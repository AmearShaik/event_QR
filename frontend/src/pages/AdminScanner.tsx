import React, { useState, useEffect } from 'react';
import { QRScanner } from '../components/QRScanner';
import { api } from '../services/api';
import { ScanResponse } from '../types';
import { QrCode, ShieldCheck } from '../components/Icons';

export const AdminScanner: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('attendance');

  useEffect(() => {
    api.getEvents().then((res) => {
      if (res.events && res.events.length > 0) {
        setEvents(res.events);
        const active = res.events.find((e: any) => e.isActive);
        if (active) setSelectedEventId(active.id);
      }
    }).catch(console.error);
  }, []);

  const handleScanResult = async (token: string): Promise<ScanResponse> => {
    return await api.scanToken(token, selectedEventId);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      <div className="w-full max-w-xl mx-auto space-y-5 text-center">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-widest border border-emerald-500/20">
            High-Speed Entrance Gate Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <QrCode className="w-7 h-7 text-emerald-400" /> Entrance QR Scanner
          </h1>
        </div>

        {events.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Target Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} {ev.isActive ? '(ACTIVE)' : '(INACTIVE)'}
                </option>
              ))}
            </select>
          </div>
        )}

        <QRScanner onScanResult={handleScanResult} autoResetDelayMs={2500} />

        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Real-time backend master verification. Duplicate entries automatically rejected.</span>
        </p>
      </div>
    </div>
  );
};
