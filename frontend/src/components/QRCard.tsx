import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, CheckCircle2, GraduationCap, ShieldCheck } from './Icons';
import { StatusBadge } from './StatusBadge';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Media } from '@capacitor-community/media';
import { Share } from '@capacitor/share';

interface QRCardProps {
  candidate: {
    studentId: string;
    name: string;
    program: string;
    college?: string;
    paymentStatus?: string;
  };
  event: {
    name: string;
  };
  token: string;
}

export const QRCard: React.FC<QRCardProps> = ({ candidate, event, token }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);

  const collegeName =
    candidate.college ||
    (candidate.studentId.trim().startsWith('1608')
      ? 'Matrusri Engineering College'
      : 'MVSR Engineering College');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const generatePassCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const scale = 2; // High resolution 2x
    const canvas = document.createElement('canvas');
    canvas.width = 600 * scale;
    canvas.height = 780 * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);

    // 1. Background
    const grad = ctx.createLinearGradient(0, 0, 600, 780);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 780);

    // 2. Border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 760);

    // 3. Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(collegeName.toUpperCase(), 300, 50);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('GRADUATION DAY 2026', 300, 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(event.name || 'Official Entrance & Ceremony Pass', 300, 105);

    // 4. Divider line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.lineTo(560, 120);
    ctx.stroke();

    // 5. Candidate Name
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CANDIDATE NAME', 50, 145);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(candidate.name, 50, 175);

    // 6. Student ID & Program
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('ROLL NUMBER / USER ID', 50, 210);
    ctx.fillText('BRANCH / PROGRAM', 320, 210);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(candidate.studentId, 50, 235);

    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(candidate.program, 320, 235);

    // 7. QR Code from SVG
    const svgEl = svgContainerRef.current?.querySelector('svg');
    if (!svgEl) return null;

    return new Promise((resolve) => {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      const qrImg = new Image();
      qrImg.onload = () => {
        // White rounded card background for QR
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(160, 265, 280, 280, 20);
        ctx.fill();

        ctx.drawImage(qrImg, 180, 285, 240, 240);
        URLObj.revokeObjectURL(blobURL);

        // Verification Badge & Footnotes
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓ CRYPTOGRAPHICALLY VERIFIED PASS', 300, 585);

        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText('Single QR pass valid for Gate Entry and Kit Allocation', 300, 615);

        resolve(canvas);
      };
      qrImg.onerror = () => resolve(null);
      qrImg.src = blobURL;
    });
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      const canvas = await generatePassCanvas();
      if (!canvas) {
        showToast('Error generating QR pass image.');
        setDownloading(false);
        return;
      }

      const fileName = `GraduationPass_${candidate.studentId.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      const dataUrl = canvas.toDataURL('image/png');
      const base64Raw = dataUrl.split(',')[1];
      const isNative = Boolean(
        (window as any).Capacitor?.isNativePlatform?.() ||
        (window as any).Capacitor !== undefined ||
        window.location.protocol === 'capacitor:'
      );

      // ── A. NATIVE CAPACITOR (ANDROID / IOS APP) ──
      if (isNative) {
        try {
          // 1. Write file to device storage
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Raw,
            directory: Directory.Cache,
          });

          // 2. Save directly to Android/iOS Photo Gallery
          try {
            await Media.savePhoto({
              path: savedFile.uri,
              albumIdentifier: 'Graduation Day Passes',
            });
            showToast('✓ Saved directly to Photo Gallery!');
          } catch (mediaErr) {
            console.warn('[Media Save Warning, fallback to Share]', mediaErr);
            // Fallback to Native System Share / Save Image dialog
            await Share.share({
              title: 'Graduation Pass 2026',
              text: `Graduation Day Pass for ${candidate.name} (${candidate.studentId})`,
              url: savedFile.uri,
              dialogTitle: 'Save QR Pass to Gallery / Share',
            });
            showToast('Pass ready in gallery/share sheet!');
          }
          setDownloading(false);
          return;
        } catch (nativeErr: any) {
          console.error('[Native Save Error]', nativeErr);
        }
      }

      // ── B. MOBILE BROWSER WEB SHARE API (CHROME / SAFARI) ──
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Could not convert canvas to image.');
          setDownloading(false);
          return;
        }

        const file = new File([blob], fileName, { type: 'image/png' });

        // If Web Share with files is supported (Android Chrome / iOS Safari)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Graduation Day Pass 2026',
              text: `Graduation Day 2026 Pass for ${candidate.name}`,
              files: [file],
            });
            showToast('Pass saved / shared successfully!');
            setDownloading(false);
            return;
          } catch (shareErr: any) {
            if (shareErr.name !== 'AbortError') {
              console.warn('[Web Share Warning]', shareErr);
            }
          }
        }

        // ── C. STANDARD BROWSER DOWNLOAD FALLBACK ──
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

        showToast('✓ QR Pass downloaded to your device!');
        setDownloading(false);
      }, 'image/png');
    } catch (err: any) {
      console.error('[Download QR Error]', err);
      showToast('Error saving QR Pass. Please screenshot your pass.');
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">{collegeName}</h3>
              <p className="text-xs text-emerald-400 font-medium">Graduation Day 2026</p>
            </div>
          </div>
          <StatusBadge status="ELIGIBLE" />
        </div>

        {/* Candidate Details */}
        <div className="space-y-3 mb-5 bg-slate-900/60 rounded-2xl p-4 border border-slate-700/40">
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
                Roll Number (User ID)
              </span>
              <span className="text-sm font-mono font-bold text-slate-200">
                {candidate.studentId}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                Branch / Program
              </span>
              <span className="text-sm font-medium text-slate-200 truncate block">
                {candidate.program}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div
          ref={svgContainerRef}
          className="flex flex-col items-center justify-center bg-white rounded-2xl p-5 shadow-inner mb-5"
        >
          <QRCodeSVG value={token} size={200} level="H" includeMargin={false} />
          <div className="flex items-center gap-1.5 mt-3 text-slate-500 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Graduation Pass</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Valid for Gate Entry & Kit Allocation checkpoints</span>
        </div>
      </div>

      {/* Download Action Button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
      >
        {downloading ? (
          <>
            <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            <span>Saving Pass...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Save QR Pass to Gallery</span>
          </>
        )}
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 z-50 bg-slate-900/95 border border-emerald-500/50 text-emerald-300 px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
