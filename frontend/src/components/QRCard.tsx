import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, CheckCircle2, GraduationCap, ShieldCheck } from './Icons';
import { StatusBadge } from './StatusBadge';

interface QRCardProps {
  candidate: {
    studentId: string;
    name: string;
    program: string;
    paymentStatus?: string;
  };
  event: {
    name: string;
  };
  token: string;
}

export const QRCard: React.FC<QRCardProps> = ({ candidate, event, token }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 750;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 600, 750);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 750);

      // Outer Border
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 580, 730);

      // Header Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GRADUATION DAY 2026', 300, 60);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(event.name || 'Official Entrance Pass', 300, 90);

      // Divider line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 110);
      ctx.lineTo(560, 110);
      ctx.stroke();

      // Candidate Info Box
      ctx.fillStyle = '#090d16';
      ctx.fillRect(40, 130, 520, 150);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CANDIDATE NAME', 60, 160);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(candidate.name, 60, 190);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('STUDENT ID', 60, 230);
      ctx.fillText('PROGRAM / COURSE', 320, 230);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(candidate.studentId, 60, 255);
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(candidate.program, 320, 255);

      // QR Code rendering from SVG element
      const svgEl = svgContainerRef.current?.querySelector('svg');
      if (svgEl) {
        const xml = new XMLSerializer().serializeToString(svgEl);
        const svg64 = btoa(unescape(encodeURIComponent(xml)));
        const image = new Image();
        image.src = 'data:image/svg+xml;base64,' + svg64;

        await new Promise((resolve) => {
          image.onload = resolve;
        });

        // White background box for QR code
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(150, 310, 300, 300);

        ctx.drawImage(image, 175, 335, 250, 250);
      }

      // Security Badge Footer
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ Cryptographically Verified Entrance Pass', 300, 650);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('Present this pass at the gate scanner for entrance verification.', 300, 685);

      // Download trigger
      const link = document.createElement('a');
      link.download = `Graduation-Pass-${candidate.studentId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG export error', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">Graduation Day 2026</h3>
              <p className="text-xs text-slate-400 font-medium">{event.name}</p>
            </div>
          </div>
          <StatusBadge status="ELIGIBLE" />
        </div>

        <div className="space-y-3 mb-6 bg-slate-900/60 rounded-2xl p-4 border border-slate-700/40">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Candidate Name
            </span>
            <span className="text-lg font-bold text-emerald-300 block leading-snug">
              {candidate.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                Student ID
              </span>
              <span className="text-sm font-mono font-bold text-slate-200">
                {candidate.studentId}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                Program / Course
              </span>
              <span className="text-sm font-medium text-slate-200 truncate block">
                {candidate.program}
              </span>
            </div>
          </div>
        </div>

        <div
          ref={svgContainerRef}
          className="flex flex-col items-center justify-center bg-white rounded-2xl p-5 shadow-inner mb-6"
        >
          <QRCodeSVG value={token} size={200} level="H" includeMargin={false} />
          <div className="flex items-center gap-1.5 mt-3 text-slate-500 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographically Verified Pass</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Present this QR card at the entrance gate</span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        Download QR Card (PNG)
      </button>
    </div>
  );
};
