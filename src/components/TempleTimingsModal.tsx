import React from 'react';
import { X, Clock, Shirt, Sparkles, Heart } from 'lucide-react';
import { TEMPLE_TIMINGS } from '../data/templeData';

interface TempleTimingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookSeva: () => void;
}

export const TempleTimingsModal: React.FC<TempleTimingsModalProps> = ({
  isOpen,
  onClose,
  onBookSeva,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1a0806] border border-[#522016] shadow-2xl p-5 sm:p-6 my-auto text-[#f6e4d2] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b150f] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2a0e0a] border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-playfair text-xl font-bold text-[#fff4e8]">
                Temple Timings & Darshan
              </h3>
              <p className="text-xs text-[#ff9933]">Garbhagriha & Sanctum Schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#270e0a] hover:bg-[#38140e] text-[#c9b4a4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timings List */}
        <div className="space-y-3 mb-5">
          {TEMPLE_TIMINGS.darshanHours.map((slot, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-[#220c08] border border-[#3e1610] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff9933]" />
                <span className="font-playfair font-semibold text-sm text-[#fff5eb]">
                  {slot.label}
                </span>
              </div>
              <span className="text-xs font-bold text-[#ffb77a] bg-[#33110b] px-3 py-1 rounded-full border border-[#ff9933]/30">
                {slot.time}
              </span>
            </div>
          ))}
        </div>

        {/* Additional Details */}
        <div className="space-y-3 mb-6 text-xs text-[#c9b4a4]">
          <div className="p-3 rounded-xl bg-[#220c08] border border-[#3e1610] flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-[#fe624e] mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-[#f6e4d2] block mb-0.5">Maha Prasadam Counter:</strong>
              {TEMPLE_TIMINGS.prasadamCounter}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#220c08] border border-[#3e1610] flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#ff9933] mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-[#f6e4d2] block mb-0.5">Senior Citizens & Divyang Darshan:</strong>
              {TEMPLE_TIMINGS.specialDarshanElderly}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#220c08] border border-[#3e1610] flex items-start gap-2.5">
            <Shirt className="w-4 h-4 text-[#ffd799] mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-[#f6e4d2] block mb-0.5">Traditional Sacred Dress Code:</strong>
              {TEMPLE_TIMINGS.dressCode}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              onBookSeva();
            }}
            className="flex-1 py-3 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-xs tracking-wide transition-colors cursor-pointer"
          >
            Book Sanctum VIP Seva
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
