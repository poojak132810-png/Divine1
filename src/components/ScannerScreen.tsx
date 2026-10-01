import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2, XCircle, Camera, Loader2, RotateCcw, Keyboard, ArrowLeft } from 'lucide-react';

interface VerifiedMember {
  memberNumber: string;
  name: string;
  designation: string;
  department: string;
  validTill: string;
  status: 'Active' | 'Revoked';
}

interface ScannerScreenProps {
  onBack?: () => void;
}

type ScanState = 'idle' | 'scanning' | 'checking' | 'result';

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onBack }) => {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [result, setResult] = useState<VerifiedMember | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [manualId, setManualId] = useState('');
  const [showManual, setShowManual] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = 'admin-qr-reader';

  const extractMemberNumber = (decodedText: string): string | null => {
    try {
      const url = new URL(decodedText);
      return url.searchParams.get('verify');
    } catch {
      // Not a URL — maybe they scanned a raw member number
      return decodedText.trim() || null;
    }
  };

  const runVerify = async (memberNumber: string) => {
    setScanState('checking');
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(memberNumber)}`);
      const data = await res.json();
      if (data.found) {
        setResult(data.member);
        setNotFound(false);
      } else {
        setResult(null);
        setNotFound(true);
      }
    } catch {
      setResult(null);
      setNotFound(true);
    } finally {
      setScanState('result');
    }
  };

  const startScanner = async () => {
    setScanState('scanning');
    setResult(null);
    setNotFound(false);

    const scanner = new Html5Qrcode(readerId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          await scanner.stop().catch(() => {});
          const memberNumber = extractMemberNumber(decodedText);
          if (memberNumber) {
            runVerify(memberNumber);
          } else {
            setNotFound(true);
            setScanState('result');
          }
        },
        () => {
          // per-frame scan failure — ignore, this fires constantly while searching
        }
      );
    } catch (err) {
      console.error('Camera start failed', err);
      setScanState('idle');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
  };

  const resetScan = async () => {
    await stopScanner();
    setResult(null);
    setNotFound(false);
    setScanState('idle');
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    setShowManual(false);
    runVerify(manualId.trim());
    setManualId('');
  };

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#ff9933] hover:text-[#ffaa4d] font-semibold mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>
      )}

      {/* IDLE: Start button */}
      {scanState === 'idle' && (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-[#1e0a07] border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933] mx-auto mb-4">
            <Camera className="w-7 h-7" />
          </div>
          <p className="text-xs text-[#a89080] mb-5">
            Hold a staff member's ID QR up to the camera to verify them instantly.
          </p>
          <button
            onClick={startScanner}
            className="px-6 py-3 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-sm cursor-pointer inline-flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Start Scanner
          </button>
          <div>
            <button
              onClick={() => setShowManual(!showManual)}
              className="mt-4 text-xs text-[#ff9933] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5" />
              Enter member ID manually
            </button>
          </div>
          {showManual && (
            <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2 max-w-xs mx-auto">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="e.g. TMP-2026-0002"
                className="flex-1 rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3 py-2 text-xs text-[#fff5ea]"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[#ff9933] text-[#331400] font-bold text-xs cursor-pointer"
              >
                Check
              </button>
            </form>
          )}
        </div>
      )}

      {/* SCANNING: Camera view */}
      {scanState === 'scanning' && (
        <div className="text-center">
          <div
            id={readerId}
            className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-[#ff9933]/50"
          />
          <p className="text-xs text-[#a89080] mt-3">Point the camera at the QR code...</p>
          <button
            onClick={resetScan}
            className="mt-3 text-xs text-[#ff6b6b] hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* CHECKING: Loading */}
      {scanState === 'checking' && (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-[#ff9933] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#a89080]">Checking the register...</p>
        </div>
      )}

      {/* RESULT: Verified or not */}
      {scanState === 'result' && (
        <div className="max-w-sm mx-auto">
          {result && (
            <div className="rounded-3xl overflow-hidden border-2 border-[#ff9933]/50 shadow-xl">
              <div className={`p-5 text-center ${result.status === 'Active' ? 'bg-[#183a18]' : 'bg-[#3d1010]'}`}>
                {result.status === 'Active' ? (
                  <CheckCircle2 className="w-10 h-10 text-white mx-auto mb-2" />
                ) : (
                  <XCircle className="w-10 h-10 text-white mx-auto mb-2" />
                )}
                <h2 className="text-lg font-bold text-white">
                  {result.status === 'Active' ? 'Pass Verified' : 'Card Revoked'}
                </h2>
              </div>
              <div className="p-5 bg-[#1a0806] space-y-2 text-xs">
                <p className="font-playfair text-lg font-bold text-[#fff4e8]">{result.name}</p>
                <p className="text-[#ff9933] font-semibold">{result.designation} · {result.department}</p>
                <div className="flex justify-between pt-2 border-t border-[#3e1610]">
                  <span className="text-[#998172]">Member ID</span>
                  <span className="font-mono font-bold text-[#ff9933]">{result.memberNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#998172]">Valid Till</span>
                  <span className="font-bold text-[#fef5ee]">{result.validTill}</span>
                </div>
              </div>
            </div>
          )}

          {notFound && (
            <div className="rounded-3xl overflow-hidden border-2 border-[#5c1a1a] shadow-xl">
              <div className="bg-[#3d1010] p-5 text-center">
                <XCircle className="w-10 h-10 text-white mx-auto mb-2" />
                <h2 className="text-lg font-bold text-white">Invalid QR</h2>
                <p className="text-xs text-[#ffb3b3] mt-1">Not issued by this temple.</p>
              </div>
            </div>
          )}

          <button
            onClick={resetScan}
            className="w-full mt-4 py-2.5 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
};