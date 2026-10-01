import React, { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { SevaItem } from '../types';

interface TodaySevaBoardProps {
  sevas: SevaItem[];
}

interface BookingRow {
  sevaId: string;
  date: string;
  slot: string;
}

// Adjust this to match your real per-slot capacity policy
const DEFAULT_CAPACITY_PER_SLOT = 50;

export const TodaySevaBoard: React.FC<TodaySevaBoardProps> = ({ sevas }) => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error('Failed to load today board', err))
      .finally(() => setLoading(false));
  }, []);

  // Only show sevas that have at least one timing slot today
  const todaySevas = sevas.slice(0, 4);

  const getSlotsLeft = (seva: SevaItem, slot: string) => {
    const bookedCount = bookings.filter(
      (b) => b.sevaId === seva.id && b.date === today && b.slot === slot
    ).length;
    return Math.max(DEFAULT_CAPACITY_PER_SLOT - bookedCount, 0);
  };

  return (
    <div className="p-4 rounded-2xl bg-[#1e0a07] border border-[#3f1610] mt-5">
      <div className="flex items-center gap-2 mb-3">
        <CalendarCheck className="w-4 h-4 text-[#ff9933]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#ff9933]">
          Today · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long' })}
        </h3>
      </div>

      {loading ? (
        <p className="text-xs text-[#998172]">Loading slots...</p>
      ) : (
        <div className="space-y-2">
          {todaySevas.map((seva) => {
            const firstSlot = seva.timings[0];
            if (!firstSlot) return null;
            const slotsLeft = getSlotsLeft(seva, firstSlot);
            const isFull = slotsLeft === 0;

            return (
              <div
                key={seva.id}
                className="flex items-center justify-between py-1.5 border-b border-[#3b140e] last:border-0"
              >
                <div>
                  <span className="text-xs font-semibold text-[#f6e4d2]">{seva.name}</span>
                  <span className="text-[10px] text-[#998172] block">{firstSlot}</span>
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    isFull ? 'text-[#e05353]' : 'text-[#7ce67c]'
                  }`}
                >
                  {isFull ? 'Full' : `${slotsLeft} slots`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};