import React from 'react';
import { X, Calendar, Sparkles, Flame, ArrowRight } from 'lucide-react';
import { FestivalItem } from '../types';
import festivalImg from '../assets/images/diwali_deepam_1788502260659.jpg';

interface FestivalDetailModalProps {
  festival: FestivalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookFestivalSeva: (festival: FestivalItem) => void;
}

export const FestivalDetailModal: React.FC<FestivalDetailModalProps> = ({
  festival,
  isOpen,
  onClose,
  onBookFestivalSeva,
}) => {
  if (!isOpen || !festival) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1a0806] border border-[#522016] shadow-2xl p-5 sm:p-6 my-auto text-[#f6e4d2] animate-in fade-in zoom-in-95 duration-200">
        {/* Festival Image Banner */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-4 border border-[#4d1911]">
          <img
            src={festivalImg}
            alt={festival.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0806] via-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-[#650000] border border-[#b22b1d] text-[#ffb4a8] text-xs font-bold uppercase tracking-wider">
              {festival.tag}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#fdf4ea]">
              <Calendar className="w-3.5 h-3.5 text-[#ff9933]" />
              <span>{festival.month} {festival.day}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-[#fdf4ea] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="font-playfair text-2xl font-bold text-[#fff4e8] mb-1">
          {festival.title}
        </h3>
        <p className="text-xs text-[#ff9933] font-medium mb-4">
          {festival.description}
        </p>

        {/* Description & Significance */}
        <div className="space-y-3 mb-5 text-xs text-[#c9b4a4]">
          <div className="p-3.5 rounded-2xl bg-[#220c08] border border-[#3e1610]">
            <strong className="text-[#f6e4d2] flex items-center gap-1.5 mb-1 text-sm font-playfair">
              <Sparkles className="w-4 h-4 text-[#ff9933]" />
              Sacred Observance
            </strong>
            <p className="leading-relaxed">{festival.detailedInfo}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#220c08] border border-[#3e1610]">
            <strong className="text-[#f6e4d2] flex items-center gap-1.5 mb-1 text-sm font-playfair">
              <Flame className="w-4 h-4 text-[#fe624e]" />
              Spiritual Significance
            </strong>
            <p className="leading-relaxed">{festival.significance}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              onBookFestivalSeva(festival);
            }}
            className="flex-1 py-3 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] text-[#331400] font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Book 10,008 Deepams Sankalpa</span>
            <ArrowRight className="w-4 h-4" />
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
