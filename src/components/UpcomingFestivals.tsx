import React from 'react';
import { Landmark, ArrowRight } from 'lucide-react';
import { FestivalItem } from '../types';

interface UpcomingFestivalsProps {
  festival: FestivalItem;
  onViewDetails: (festival: FestivalItem) => void;
}

export const UpcomingFestivals: React.FC<UpcomingFestivalsProps> = ({
  festival,
  onViewDetails,
}) => {
  return (
    <section className="mt-6">
      <div
        id="upcoming-festivals-card"
        onClick={() => onViewDetails(festival)}
        className="rounded-2xl bg-[#1c0806]/95 backdrop-blur-md border border-[#541f17] p-4 sm:p-5 hover:border-[#ff9933]/60 transition-all duration-300 cursor-pointer group shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-[#ff9933]/10"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between mb-3.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 text-[#ff9933]" />
              <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#fef5ee] tracking-tight">
                Upcoming Festivals
              </h2>
            </div>
            <p className="text-[12px] text-[#c9b4a4] tracking-wide">
              Sacred auspicious observances & pujas
            </p>
          </div>

          {/* Right Circular Arrow Button */}
          <div className="w-8 h-8 rounded-full bg-[#2f100a] group-hover:bg-[#ff9933] group-hover:text-[#331400] text-[#ff9933] border border-[#6b2519] flex items-center justify-center transition-all shadow-sm">
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Featured Festival Item matching screenshot */}
        <div className="rounded-xl bg-[#280e0a]/95 border border-[#521c13] p-3 sm:p-3.5 flex items-center gap-3.5 shadow-inner">
          {/* Gold Date Block */}
          <div className="w-14 h-14 rounded-xl bg-[#ffd799] text-[#4d2600] flex flex-col items-center justify-center font-bold flex-shrink-0 shadow-inner">
            <span className="text-[10px] uppercase tracking-wider font-extrabold -mb-0.5">
              {festival.month}
            </span>
            <span className="text-2xl font-black leading-none font-playfair">
              {festival.day}
            </span>
          </div>

          {/* Title and Tag */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-playfair text-base sm:text-lg font-bold text-[#fff4e8] truncate">
                {festival.title}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#650000] border border-[#b22b1d]/60 text-[#ffb4a8] text-[10px] font-bold tracking-wider uppercase">
                {festival.tag}
              </span>
            </div>
            <p className="text-xs text-[#c9b4a4] truncate">
              {festival.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
