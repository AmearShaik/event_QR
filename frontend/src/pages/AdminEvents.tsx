import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Calendar, Plus, RefreshCw, CheckCircle2, XCircle, Power, BarChart2 } from '../components/Icons';

export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [selectedEventStats, setSelectedEventStats] = useState<any | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEvents();
      setEvents(res.events);
    } catch (err: any) {
      setError(err.message || 'Failed to load ceremony events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    setSubmitting(true);
    try {
      await api.createEvent({ name, slug, description });
      setShowCreateModal(false);
      setName('');
      setSlug('');
      setDescription('');
      fetchEvents();
    } catch (err: any) {
      alert('Failed to create event: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.updateEvent(id, { isActive: !currentStatus });
      fetchEvents();
    } catch (err: any) {
      alert('Failed to update event status');
    }
  };

  const handleViewStats = async (id: string) => {
    try {
      const stats = await api.getEventStats(id);
      setSelectedEventStats(stats);
    } catch (err: any) {
      alert('Failed to load event stats');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-emerald-400" />
            Graduation Ceremony Events
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure graduation ceremony sessions and gate entrance event targets.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Create New Ceremony Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => (
          <div
            key={ev.id}
            className={`bg-slate-800/80 backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden ${
              ev.isActive ? 'border-emerald-500/40' : 'border-slate-700/80'
            }`}
          >
            {ev.isActive && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                ACTIVE GATE TARGET
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  [{ev.slug}]
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{ev.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{ev.description || 'No description provided.'}</p>
            </div>

            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Check-Ins:</span>
              <span className="font-mono font-bold text-emerald-400 text-base">
                {ev._count ? ev._count.attendances : 0}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
              <button
                onClick={() => handleToggleActive(ev.id, ev.isActive)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  ev.isActive
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {ev.isActive ? 'Deactivate Gate' : 'Set Active Target'}
              </button>

              <button
                onClick={() => handleViewStats(ev.id)}
                className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
                title="View Session Stats"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <h3 className="text-lg font-bold text-white">Create Ceremony Session</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Event Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Morning Session - Engineering"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Event Slug ID
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. morning-session"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes or gate location..."
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  rows={3}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEventStats && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedEventStats.event.name}</h3>
                <span className="text-xs text-slate-400 font-mono">[{selectedEventStats.event.slug}]</span>
              </div>
              <button
                onClick={() => setSelectedEventStats(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Check-In Count</span>
                <span className="text-2xl font-black text-emerald-400">{selectedEventStats.attendanceCount}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-medium">Eligible Candidates</span>
                <span className="text-2xl font-black text-white">{selectedEventStats.totalEligible}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEventStats(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Stats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
