import React from 'react';
import { X, Bell, Flame, Sparkles, Calendar, CheckCheck } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewSchedule: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onViewSchedule,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: '1',
      type: 'darshan',
      title: '🔔 Shringar Aarti Starting Soon',
      time: 'In 15 minutes (7:15 AM)',
      desc: 'Priests are commencing special floral adornment in the Garbhagriha.',
      actionLabel: 'View Schedule',
      action: onViewSchedule,
      icon: Flame,
      color: 'text-[#ff9933]',
    },
    {
      id: '2',
      type: 'panchang',
      title: '✨ Abhijit Muhurta Today',
      time: '11:48 AM - 12:38 PM',
      desc: 'Optimal window for new sankalpas, mantras, and auspicious ventures.',
      actionLabel: 'View Details',
      action: onViewSchedule,
      icon: Sparkles,
      color: 'text-[#ff9933]',
    },
    {
      id: '3',
      type: 'festival',
      title: '🪔 Diwali Mahotsav Registration Open',
      time: 'Oct 24, 2026',
      desc: 'Sponsor a sacred Ghee Deepam for the grand 10,008 illumination ceremony.',
      actionLabel: 'Book Sankalpa',
      action: onViewSchedule,
      icon: Calendar,
      color: 'text-[#ffd799]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end bg-black/75 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#1a0806] border border-[#522016] shadow-2xl p-5 text-[#f6e4d2] animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3b150f] mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#ff9933]" />
            <h3 className="font-playfair text-base font-bold text-[#fff4e8]">
              Temple Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#270e0a] hover:bg-[#38140e] text-[#c9b4a4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 mb-4">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="p-3 rounded-2xl bg-[#220c08] border border-[#3e1610] text-xs space-y-1.5 hover:border-[#ff9933]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#fff5ea] flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${n.color}`} />
                    {n.title}
                  </span>
                  <span className="text-[10px] text-[#ffb77a]">{n.time}</span>
                </div>
                <p className="text-[#a89080] text-[11px] leading-relaxed">{n.desc}</p>
                <button
                  onClick={() => {
                    onClose();
                    n.action();
                  }}
                  className="mt-1 text-[11px] font-bold text-[#ff9933] hover:text-[#ffaa4d] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{n.actionLabel}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#270e0a] hover:bg-[#38140e] text-xs font-semibold text-[#c9b4a4] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Dismiss All</span>
        </button>
      </div>
    </div>
  );
};
