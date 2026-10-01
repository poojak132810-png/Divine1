import React from 'react';
import { Clock, Sunrise, Sun, Moon, Sparkles, ChevronRight } from 'lucide-react';
import { AartiScheduleItem } from '../types';

interface TodayScheduleProps {
  aartis: AartiScheduleItem[];
  onViewAll: () => void;
  onSelectAarti: (aarti: AartiScheduleItem) => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  aartis,
  onViewAll,
  onSelectAarti,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'mangala':
        return <Sunrise className="w-5 h-5 text-[#ffb77a]" />;
      case 'shringar':
        return <Sun className="w-5 h-5 text-[#ff9933] animate-spin" style={{ animationDuration: '24s' }} />;
      case 'sandhya':
        return <Moon className="w-5 h-5 text-[#fe624e]" />;
      case 'shayan':
        return <Sparkles className="w-5 h-5 text-[#d0af00]" />;
      default:
        return <Sun className="w-5 h-5 text-[#ff9933]" />;
    }
  };

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#ff9933]" />
          <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#fef6ee] tracking-tight">
            Today's Schedule
          </h2>
        </div>
        <button
          id="btn-view-all-schedule"
          onClick={onViewAll}
          className="text-xs font-bold tracking-wider text-[#ff9933] hover:text-[#ffaa4d] flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>VIEW ALL</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Scroll Cards matching screenshot */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        {aartis.map((item) => {
          const isUpNext = item.status === 'up-next';
          const isCompleted = item.status === 'completed';

          return (
            <div
              key={item.id}
              onClick={() => onSelectAarti(item)}
              className={`flex-shrink-0 w-[205px] sm:w-[220px] rounded-2xl p-4 transition-all duration-300 cursor-pointer snap-start relative ${
                isUpNext
                  ? 'bg-[#280e0a]/98 backdrop-blur-md border-2 border-[#ff9933] shadow-2xl shadow-[#ff9933]/20 ring-1 ring-[#ff9933]/40'
                  : 'bg-[#1c0806]/95 backdrop-blur-md border border-[#521f17] shadow-xl shadow-black/60 hover:border-[#ff9933]/50'
              }`}
            >
              {/* Card Top: Icon and Status Pill */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isUpNext ? 'bg-[#38140c]' : 'bg-[#260c08]'
                  }`}
                >
                  {getIcon(item.id)}
                </div>

                {/* Badge */}
                {isCompleted && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2a100a] text-[#a98f7e] text-[10px] font-semibold tracking-wider">
                    Completed
                  </span>
                )}
                {isUpNext && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3d1a10] border border-[#ff9933]/60 text-[#ffb77a] text-[10px] font-bold tracking-wider uppercase">
                    Up Next
                  </span>
                )}
                {item.status === 'upcoming' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#250d08] text-[#ff9933]/80 text-[10px] font-semibold tracking-wider">
                    Upcoming
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-playfair text-[17px] font-bold text-[#fff3e5] leading-snug mb-1">
                {item.title}
                {item.kannadaTitle && (
                  <span className="block text-xs font-normal font-sans text-[#ffb77a]/90 mt-0.5">
                    {item.kannadaTitle}
                  </span>
                )}
              </h3>

              {/* Time */}
              <p className="text-[12px] font-semibold text-[#ff9933] tracking-wide mb-2">
                {item.time}
              </p>

              {/* Ritual Description */}
              <p className="text-[11px] text-[#c9b4a4] line-clamp-2 leading-relaxed italic">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
