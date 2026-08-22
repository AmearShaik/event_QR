import React, { useState, useEffect } from 'react';
import { QRScanner } from '../components/QRScanner';
import { api } from '../services/api';
import { ScanResponse } from '../types';
import { ShieldCheck } from '../components/Icons';

interface EventOption {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  requiresPayment: boolean;
}

export const AdminScanner: React.FC = () => {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [activeEventId, setActiveEventId] = useState<string>('');
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    api.getEvents().then((res) => {
      if (res.events && res.events.length > 0) {
        const all: EventOption[] = res.events;
        setEvents(all);

        // Auto-select first active event
        const active = all.find((e) => e.isActive);
        if (active) setActiveEventId(active.id);
        else if (all.length > 0) setActiveEventId(all[0].id);
      }
    }).catch(console.error).finally(() => setLoadingEvents(false));
  }, []);

  const handleScanResult = async (token: string): Promise<ScanResponse> => {
    return await api.scanToken(token, activeEventId);
  };

  const activeEvent = events.find((e) => e.id === activeEventId);
  const isEntrance = activeEvent ? !activeEvent.requiresPayment : true;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      <div className="w-full max-w-xl mx-auto space-y-5 text-center">

        {/* Header */}
        <div className="space-y-1 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            {isEntrance ? 'Entrance Scanner' : 'Kit Allocation Scanner'}
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isEntrance
              ? 'All registered students are allowed entry regardless of payment status.'
              : 'Only candidates with PAID status are eligible to collect their kit.'}
          </p>
        </div>

        {/* Event Selector for active mode */}
        {!loadingEvents && events.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Target Event:</span>
            <select
              id="scanner-event-select"
              value={activeEventId}
              onChange={(e) => setActiveEventId(e.target.value)}
              className={`bg-slate-800 border text-white font-bold text-sm rounded-xl px-4 py-2 focus:outline-none transition-all w-full max-w-xs ${
                isEntrance
                  ? 'border-emerald-600/50 focus:ring-2 focus:ring-emerald-500'
                  : 'border-violet-600/50 focus:ring-2 focus:ring-violet-500'
              }`}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} {ev.isActive ? '(ACTIVE)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 ${
            isEntrance
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              : 'bg-violet-500/10 text-violet-300 border-violet-500/20'
          }`}
        >
          <span>
            {isEntrance
              ? 'Any student with a valid QR code will be allowed through.'
              : 'Scanner will reject non-paid candidates with a NOT ELIGIBLE response.'}
          </span>
        </div>

        {/* QR Scanner Component — unchanged */}
        <QRScanner onScanResult={handleScanResult} autoResetDelayMs={2500} />

        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Real-time backend master verification. Duplicate entries automatically rejected.</span>
        </p>
      </div>
    </div>
  );
};
