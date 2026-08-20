import React, { useState, useEffect } from 'react';
import { api, getApiBaseUrl, isNativePlatform } from '../services/api';
import { Server, CheckCircle2, AlertTriangle, RefreshCw, XCircle, Globe, Wifi, Sparkles } from './Icons';

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ isOpen, onClose }) => {
  const [serverUrl, setServerUrl] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const presets = api.getRecommendedPresets();
  const isMobile = isNativePlatform();

  useEffect(() => {
    if (isOpen) {
      setServerUrl(api.getServerUrl());
      setTestResult(null);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await api.testConnection(serverUrl);
      setTestResult({
        ok: result.ok,
        message: result.message || (result.ok ? 'Connection successful!' : 'Connection failed.'),
      });
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || 'Failed to connect.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    api.setServerUrl(serverUrl);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 600);
  };

  const handleReset = () => {
    api.setServerUrl('');
    setServerUrl('');
    setTestResult(null);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 600);
  };

  const handleSelectPreset = (url: string) => {
    setServerUrl(url);
    setTestResult(null);
  };

  const activeBase = getApiBaseUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Server Connection</h3>
              <p className="text-xs text-slate-400">Mobile & Backend Network Endpoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-left overflow-y-auto">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Presets:</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-0.5 ${
                    serverUrl.trim() === preset.url
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{preset.label}</span>
                    <span className="text-[10px] font-mono opacity-70">{preset.url}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Custom Backend Server URL</span>
              <span className="text-[10px] text-slate-500 font-normal">e.g. http://192.168.1.19:5000</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://192.168.1.19:5000 or https://..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-300">Active API Base:</span>
              <span className="font-mono text-emerald-400 break-all">{activeBase}</span>
            </div>
            <p className="text-slate-400 pt-1 text-[10px]">
              • If using phone on same Wi-Fi as host PC, select <strong className="text-white">Local Wi-Fi (http://192.168.1.19:5000)</strong>.
              <br />
              • If backend is deployed online, enter your cloud HTTPS URL.
            </p>
          </div>

          {/* Test Connection Result */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                testResult.ok
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="truncate">{testResult.message}</span>
            </div>
          )}

          {isSaved && (
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-300">
              Settings saved! Reloading...
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wifi className="w-3.5 h-3.5" />
              )}
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Apply</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
            >
              Reset to Default (/api)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
