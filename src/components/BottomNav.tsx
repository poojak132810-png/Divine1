import React from 'react';
import { Home, BookOpen, CalendarCheck, HeartHandshake, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'shlokas' as TabType, label: 'Shlokas', icon: BookOpen },
    { id: 'bookings' as TabType, label: 'Bookings', icon: CalendarCheck },
    { id: 'donations' as TabType, label: 'Donations', icon: HeartHandshake },
    { id: 'ai' as TabType, label: 'AI Pandit', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#160605]/95 backdrop-blur-lg border-t border-[#3c1610] pb-[env(safe-area-inset-bottom,8px)] pt-1.5 px-2 shadow-2xl shadow-black md:hidden">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 group cursor-pointer"
            >
              {isActive ? (
                /* Active Tab with Rounded Saffron/Gold Pill Container */
                <div className="flex flex-col items-center justify-center px-2.5 py-1 rounded-full bg-[#ffd799] text-[#422000] shadow-md shadow-[#ffd799]/20 animate-in zoom-in-95 duration-150">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
                    {tab.label}
                  </span>
                </div>
              ) : (
                /* Inactive Tab */
                <div className="flex flex-col items-center justify-center text-[#998172] group-hover:text-[#ffb77a] transition-colors py-1">
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                  <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                    {tab.label}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
