import React, { useState } from 'react';
import { api } from '../services/api';
import { ImportPreviewResponse, ImportConfirmResponse } from '../types';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Info, ArrowRight, RefreshCw } from '../components/Icons';
import { StatusBadge } from '../components/StatusBadge';

export const AdminImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [loadingConfirm, setLoadingConfirm] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
  const [confirmResult, setConfirmResult] = useState<ImportConfirmResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewData(null);
      setConfirmResult(null);
      setErrorMsg(null);
    }
  };

  const handleUploadPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoadingPreview(true);
    setErrorMsg(null);
    setPreviewData(null);
    setConfirmResult(null);

    try {
      const data = await api.uploadPreview(selectedFile);
      setPreviewData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse import file.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || !selectedFile) return;

    setLoadingConfirm(true);
    setErrorMsg(null);

    try {
      const res = await api.confirmImport(previewData.previewRows, selectedFile.name);
      setConfirmResult(res);
      setPreviewData(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to confirm candidate import.');
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Official Candidate Data Import
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload administrator-controlled CSV or XLSX file. Candidate IDs, payment status, and eligibility are governed by this master source of truth.
        </p>
      </div>

      <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 rounded-2xl p-4 text-xs font-medium flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sky-200 text-sm mb-0.5">Recommended Source File Format</p>
          <p>For reliable import, upload the original clean CSV/XLSX file whenever possible.</p>
        </div>
      </div>

      {!confirmResult && (
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <form onSubmit={handleUploadPreview} className="space-y-6">
            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 text-center bg-slate-900/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {selectedFile ? selectedFile.name : 'Click to select CSV or XLSX candidate file'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Supports .csv, .xlsx files up to 10MB</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedFile || loadingPreview}
                className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingPreview ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Validating File & Generating Preview...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload & Validate File
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-4 text-xs font-medium flex items-center gap-2.5">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {previewData && (
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Import Preview & Validation</h3>
              <p className="text-xs text-slate-400">
                Review normalized payment status and eligibility before saving.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-700 text-slate-300">
                Total Rows: {previewData.totalRows}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Valid: {previewData.validRows}
              </span>
              {previewData.invalidRows > 0 && (
                <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Invalid: {previewData.invalidRows}
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-700">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Raw Status</th>
                  <th className="py-3 px-4">Normalized Status</th>
                  <th className="py-3 px-4">Eligibility</th>
                  <th className="py-3 px-4">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium">
                {previewData.previewRows.slice(0, 100).map((row) => (
                  <tr key={row.rowNumber} className={!row.isValid ? 'bg-rose-950/20' : 'hover:bg-slate-700/30'}>
                    <td className="py-3 px-4 text-slate-500">{row.rowNumber}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{row.studentId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{row.name}</td>
                    <td className="py-3 px-4 text-slate-400">{row.program}</td>
                    <td className="py-3 px-4 text-slate-400">{row.paymentStatus}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={row.normalizedPaymentStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={row.eligibility ? 'ELIGIBLE' : 'NOT_ELIGIBLE'} />
                    </td>
                    <td className="py-3 px-4">
                      {row.isValid ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          {row.warning && <span className="text-[10px] text-amber-300 font-normal">({row.warning})</span>}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> {row.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {previewData.previewRows.length > 100 && (
            <p className="text-xs text-slate-500 text-center">
              Showing first 100 rows of {previewData.previewRows.length} total rows.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={() => setPreviewData(null)}
              className="py-3 px-5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={loadingConfirm || previewData.validRows === 0}
              className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loadingConfirm ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Upserting Master Records...
                </>
              ) : (
                <>
                  Confirm Import ({previewData.validRows} Candidates)
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {confirmResult && (
        <div className="bg-slate-800/80 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-extrabold text-white">Import Complete!</h3>
              <p className="text-xs text-slate-400">Database successfully updated with official candidate data.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Rows</span>
              <span className="text-2xl font-black text-white">{confirmResult.totalRows}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">New Candidates</span>
              <span className="text-2xl font-black text-emerald-400">{confirmResult.newCandidates}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-sky-500/30">
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">Updated Candidates</span>
              <span className="text-2xl font-black text-sky-300">{confirmResult.updatedCandidates}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Unchanged</span>
              <span className="text-2xl font-black text-slate-300">{confirmResult.unchangedCandidates}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-rose-500/30">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Rejected Rows</span>
              <span className="text-2xl font-black text-rose-400">{confirmResult.rejectedRows}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setConfirmResult(null);
              setSelectedFile(null);
            }}
            className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
};
