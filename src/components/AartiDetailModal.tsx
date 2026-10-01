import React, { useState } from 'react';
import { X, Clock, Bell, Check, Sparkles, Music } from 'lucide-react';
import { AartiScheduleItem } from '../types';
import { playChime } from '../utils/audio';

interface AartiDetailModalProps {
  aarti: AartiScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AartiDetailModal: React.FC<AartiDetailModalProps> = ({
  aarti,
  isOpen,
  onClose,
}) => {
  const [reminded, setReminded] = useState(false);

  if (!isOpen || !aarti) return null;

  const handleToggleReminder = () => {
    setReminded(!reminded);
    playChime();
  };

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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-playfair text-xl font-bold text-[#fff4e8]">
                  {aarti.title}
                </h3>
                {aarti.kannadaTitle && (
                  <span className="text-xs text-[#ffd799] font-sans">({aarti.kannadaTitle})</span>
                )}
                {aarti.hindiTitle && (
                  <span className="text-xs text-[#ff9933]">({aarti.hindiTitle})</span>
                )}
              </div>
              <p className="text-xs text-[#c9b4a4]">{aarti.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#270e0a] hover:bg-[#38140e] text-[#c9b4a4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Time Banner */}
        <div className="p-3.5 rounded-2xl bg-[#250d09] border border-[#521b12] flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ff9933]" />
            <span className="text-xs text-[#c9b4a4]">Sacred Timings</span>
          </div>
          <span className="text-sm font-bold text-[#ffb77a]">{aarti.time}</span>
        </div>

        {/* Deity Adornment & Ritual Focus */}
        <div className="p-4 rounded-2xl bg-[#220c08] border border-[#3e1610] mb-4 text-xs space-y-2">
          <div className="text-[#ff9933] font-bold uppercase tracking-wider text-[10px]">
            Garbhagriha Ritual Focus
          </div>
          <p className="text-[#f6e4d2] leading-relaxed">{aarti.deityFocus}</p>
        </div>

        {/* Sacred Mantra */}
        {aarti.mantra && (
          <div className="p-4 rounded-2xl bg-[#280c07] border border-[#ff9933]/30 mb-5 text-center">
            <Music className="w-4 h-4 text-[#ff9933] mx-auto mb-1.5" />
            <span className="text-[10px] uppercase font-bold text-[#ff9933] tracking-widest block mb-1">
              Ritual Chanting Mantra
            </span>
            <p className="font-playfair text-sm text-[#ffeeda] font-semibold italic">
              {aarti.mantra}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleToggleReminder}
            className={`flex-1 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              reminded
                ? 'bg-[#214021] text-[#78e678] border-[#347834]'
                : 'bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] border-[#ff9933]'
            }`}
          >
            {reminded ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            <span>{reminded ? 'Aarti Reminder Set' : 'Set Aarti Reminder'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-[#270e0a] hover:bg-[#38140e] text-[#c9b4a4] hover:text-[#fff4e8] border border-[#5a2118] font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
