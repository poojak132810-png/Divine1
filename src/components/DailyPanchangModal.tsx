import React from 'react';
import { X, Sparkles, Sun, Moon, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PANCHANG_DATA } from '../data/templeData';

interface DailyPanchangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsultPandit: (question: string) => void;
}

export const DailyPanchangModal: React.FC<DailyPanchangModalProps> = ({
  isOpen,
  onClose,
  onConsultPandit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1a0806] border border-[#522016] shadow-2xl p-5 sm:p-6 my-auto text-[#f6e4d2] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b150f] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2a0e0a] border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-playfair text-xl font-bold text-[#fff4e8]">
                Vedic Daily Panchang
              </h3>
              <p className="text-xs text-[#ff9933]">{PANCHANG_DATA.samvat}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#270e0a] hover:bg-[#38140e] text-[#c9b4a4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tithi & Nakshatra Prominent Card */}
        <div className="p-4 rounded-2xl bg-[#250d09] border border-[#521b12] mb-4">
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#ff9933] tracking-wider block mb-0.5">
                Current Tithi
              </span>
              <h4 className="font-playfair font-bold text-base text-[#fff5ea]">
                {PANCHANG_DATA.tithi}
              </h4>
              <p className="text-[11px] text-[#c9b4a4] mt-0.5">{PANCHANG_DATA.tithiEnd}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#ff9933] tracking-wider block mb-0.5">
                Nakshatra
              </span>
              <h4 className="font-playfair font-bold text-base text-[#fff5ea]">
                {PANCHANG_DATA.nakshatra}
              </h4>
              <p className="text-[11px] text-[#c9b4a4] mt-0.5">{PANCHANG_DATA.nakshatraEnd}</p>
            </div>
          </div>
        </div>

        {/* Auspicious & Inauspicious Muhurtas */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="p-3 rounded-xl bg-[#142614] border border-[#235823]/50">
            <div className="flex items-center gap-1.5 text-[#62d262] font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Abhijit Muhurta</span>
            </div>
            <p className="font-bold text-[#f0fff0] text-[13px]">{PANCHANG_DATA.abhijitMuhurta}</p>
            <p className="text-[10px] text-[#a0cfa0] mt-0.5">Most auspicious for sankalpa</p>
          </div>

          <div className="p-3 rounded-xl bg-[#2a100d] border border-[#6b2219]/60">
            <div className="flex items-center gap-1.5 text-[#fe624e] font-bold mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Rahu Kalam</span>
            </div>
            <p className="font-bold text-[#ffebe8] text-[13px]">{PANCHANG_DATA.rahuKalam}</p>
            <p className="text-[10px] text-[#df9a92] mt-0.5">Avoid starting new ventures</p>
          </div>
        </div>

        {/* Sun & Moon Timings */}
        <div className="p-3 rounded-xl bg-[#220c08] border border-[#3e1610] mb-5 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <Sun className="w-4 h-4 text-[#ff9933] mx-auto mb-1" />
            <span className="text-[10px] text-[#a89080] block">Sunrise</span>
            <span className="font-semibold text-[#f6e4d2]">{PANCHANG_DATA.sunrise}</span>
          </div>
          <div>
            <Sun className="w-4 h-4 text-[#fe624e] mx-auto mb-1" />
            <span className="text-[10px] text-[#a89080] block">Sunset</span>
            <span className="font-semibold text-[#f6e4d2]">{PANCHANG_DATA.sunset}</span>
          </div>
          <div>
            <Moon className="w-4 h-4 text-[#ffd799] mx-auto mb-1" />
            <span className="text-[10px] text-[#a89080] block">Moonrise</span>
            <span className="font-semibold text-[#f6e4d2]">{PANCHANG_DATA.moonrise}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              onConsultPandit('What are the spiritual practices recommended for today based on Panchang?');
            }}
            className="flex-1 py-3 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-xs tracking-wide transition-colors cursor-pointer"
          >
            Ask Pandit AI About Today
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-[#270e0a] hover:bg-[#38140e] text-[#f6e4d2] font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
