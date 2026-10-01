import React from 'react';
import { LayoutGrid, Clock, Calendar, HeartHandshake, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

interface QuickServicesProps {
  onOpenTimings: () => void;
  onOpenBookings: () => void;
  onOpenOfferings: () => void;
  onOpenPanchang: () => void;
  onOpenShlokas?: () => void;
}

export const QuickServices: React.FC<QuickServicesProps> = ({
  onOpenTimings,
  onOpenBookings,
  onOpenOfferings,
  onOpenPanchang,
  onOpenShlokas,
}) => {
  return (
    <section className="mt-6">
      {/* Header matching screenshot */}
      <div className="flex items-center gap-2 mb-3.5 px-1">
        <LayoutGrid className="w-4 h-4 text-[#ff9933]" />
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#fef5ee] tracking-tight">
          Quick Devotional Services
        </h2>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {/* Card 1: Temple Timings */}
        <div
          id="card-temple-timings"
          onClick={onOpenTimings}
          className="rounded-2xl bg-[#1c0806]/95 backdrop-blur-md border border-[#541f17] p-4 flex flex-col justify-between hover:border-[#ff9933]/60 transition-all duration-300 cursor-pointer shadow-xl shadow-black/50 group hover:shadow-2xl hover:shadow-[#ff9933]/10"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#32110b] border border-[#6b2519] text-[#ff9933] flex items-center justify-center mb-3 shadow-inner">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-playfair text-[15px] sm:text-base font-bold text-[#fff8ee] leading-tight mb-0.5">
              Temple Timings
            </h3>
            <p className="text-[11px] text-[#cbb6a7] mb-3">
              Darshan Hours
            </p>
          </div>

          <div className="text-[11px] sm:text-xs font-semibold text-[#ffb77a] space-y-0.5">
            <p>04:30 AM - 12:30 PM</p>
            <p>04:00 PM - 09:00 PM</p>
          </div>
        </div>

        {/* Card 2: Book Seva */}
        <div
          id="card-book-seva"
          onClick={onOpenBookings}
          className="rounded-2xl bg-[#1c0806]/95 backdrop-blur-md border border-[#541f17] p-4 flex flex-col justify-between hover:border-[#ff9933]/60 transition-all duration-300 cursor-pointer shadow-xl shadow-black/50 group hover:shadow-2xl hover:shadow-[#ff9933]/10"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#32110b] border border-[#6b2519] text-[#ff9933] flex items-center justify-center mb-3 shadow-inner">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-playfair text-[15px] sm:text-base font-bold text-[#fff8ee] leading-tight mb-0.5">
              Book Seva
            </h3>
            <p className="text-[11px] text-[#cbb6a7]">
              Abhishek & Archana
            </p>
          </div>

          <div className="pt-3 border-t border-[#461912] flex items-center justify-between text-xs font-semibold text-[#ff9933] group-hover:text-[#ffb77a]">
            <span>Reserve Slot</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Make Offering */}
        <div
          id="card-make-offering"
          onClick={onOpenOfferings}
          className="rounded-2xl bg-[#1c0806]/95 backdrop-blur-md border border-[#541f17] p-4 flex flex-col justify-between hover:border-[#ff9933]/60 transition-all duration-300 cursor-pointer shadow-xl shadow-black/50 group hover:shadow-2xl hover:shadow-[#ff9933]/10"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#32110b] border border-[#6b2519] text-[#fe624e] flex items-center justify-center mb-3 shadow-inner">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="font-playfair text-[15px] sm:text-base font-bold text-[#fff8ee] leading-tight mb-0.5">
              Make Offering
            </h3>
            <p className="text-[11px] text-[#cbb6a7]">
              Support the Temple
            </p>
          </div>

          <div className="pt-3 border-t border-[#461912] flex items-center justify-between text-xs font-semibold text-[#ff9933] group-hover:text-[#ffb77a]">
            <span>Hundi / INR ₹</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Daily Panchang */}
        <div
          id="card-daily-panchang"
          onClick={onOpenPanchang}
          className="rounded-2xl bg-[#1c0806]/95 backdrop-blur-md border border-[#541f17] p-4 flex flex-col justify-between hover:border-[#ff9933]/60 transition-all duration-300 cursor-pointer shadow-xl shadow-black/50 group hover:shadow-2xl hover:shadow-[#ff9933]/10"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#32110b] border border-[#6b2519] text-[#ff9933] flex items-center justify-center mb-3 shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-playfair text-[15px] sm:text-base font-bold text-[#fff8ee] leading-tight mb-0.5">
              Daily Panchang
            </h3>
            <p className="text-[11px] text-[#cbb6a7]">
              Tithi & Muhurta
            </p>
          </div>

          <div className="pt-3 border-t border-[#461912] flex items-center justify-between text-xs font-semibold text-[#ff9933] group-hover:text-[#ffb77a]">
            <span>Shukla Paksha</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Featured Sacred Shlokas Quick Action */}
      {onOpenShlokas && (
        <div
          id="card-sacred-shlokas-quick"
          onClick={onOpenShlokas}
          className="mt-3.5 rounded-2xl bg-gradient-to-r from-[#2a0e08] via-[#35120a] to-[#250c07] border border-[#ff9933]/40 p-3.5 flex items-center justify-between hover:border-[#ff9933] transition-all cursor-pointer shadow-xl shadow-black/50 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#44180f] border border-[#ff9933]/50 text-[#ffb77a] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-[#ff9933]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-playfair text-sm sm:text-base font-bold text-[#fff8ee]">
                  Sacred Shlokas & Mantras
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#521b10] text-[#ffd799] text-[10px] font-bold border border-[#ff9933]/30">
                  Daily Stotras
                </span>
              </div>
              <p className="text-[11px] text-[#cbb6a7] line-clamp-1">
                Vakratunda • Maha Mrityunjaya • Gayatri • Japa Counter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-[#ff9933] group-hover:text-[#ffd799] shrink-0 ml-2">
            <span className="hidden sm:inline">Chant</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}
    </section>
  );
};
