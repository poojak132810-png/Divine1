import React, { useState } from 'react';
import { Globe, Bell, Landmark, Check, Flower2, SlidersHorizontal, Home, BookOpen, CalendarCheck, HeartHandshake, Sparkles ,ShieldCheck} from 'lucide-react';
import { LanguageCode, TabType } from '../types';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  isFlowerShowerActive?: boolean;
  onToggleFlowerShower?: () => void;
  bgOpacity?: number;
  onBgOpacityChange?: (val: number) => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onOpenCornerAI?: () => void;
}

const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenNotifications,
  unreadCount = 2,
  isFlowerShowerActive = true,
  onToggleFlowerShower,
  bgOpacity = 0.38,
  onBgOpacityChange,
  activeTab = 'home',
  onTabChange,
  onOpenCornerAI,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showAdjuster, setShowAdjuster] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#160706]/95 backdrop-blur-md border-b border-[#3d1812] px-4 py-2.5 sm:py-3 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Temple Icon & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Ornate Temple Icon Container */}
          <div
            id="header-temple-badge"
            onClick={() => onTabChange && onTabChange('home')}
            className="w-10 h-10 rounded-xl bg-[#2a100b] border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933] shadow-md shadow-[#ff9933]/10 cursor-pointer"
          >
            <Landmark className="w-5 h-5 stroke-[1.8]" />
          </div>

          <div>
            <h1
              onClick={() => onTabChange && onTabChange('home')}
              className="font-playfair text-[18px] sm:text-[20px] font-bold tracking-tight text-[#fdf4e9] leading-tight cursor-pointer hover:text-[#ffd799] transition-colors"
            >
              Dharma Devotee Hub
            </h1>
            <p className="text-[11px] sm:text-[12px] text-[#ff9933] font-medium tracking-wide flex items-center gap-1">
              <span>ॐ श्री परमात्मने नमः</span>
            </p>
          </div>
        </div>

        {/* Center: Website/Desktop Navigation (Home, Bookings, Donations) */}
        {onTabChange && (
          <nav
            id="desktop-top-nav"
            className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#240c08] border border-[#ff9933]/30 shadow-inner"
          >
            <button
              id="top-nav-home"
              onClick={() => onTabChange('home')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#ffd799] text-[#3b1900] shadow-sm shadow-[#ffd799]/30 font-bold'
                  : 'text-[#d6beae] hover:text-[#fff] hover:bg-[#34130d]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              id="top-nav-shlokas"
              onClick={() => onTabChange('shlokas')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'shlokas'
                  ? 'bg-[#ffd799] text-[#3b1900] shadow-sm shadow-[#ffd799]/30 font-bold'
                  : 'text-[#d6beae] hover:text-[#fff] hover:bg-[#34130d]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Shlokas</span>
            </button>

            <button
              id="top-nav-bookings"
              onClick={() => onTabChange('bookings')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#ffd799] text-[#3b1900] shadow-sm shadow-[#ffd799]/30 font-bold'
                  : 'text-[#d6beae] hover:text-[#fff] hover:bg-[#34130d]'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Bookings</span>
            </button>

            <button
              id="top-nav-donations"
              onClick={() => onTabChange('donations')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'donations'
                  ? 'bg-[#ffd799] text-[#3b1900] shadow-sm shadow-[#ffd799]/30 font-bold'
                  : 'text-[#d6beae] hover:text-[#fff] hover:bg-[#34130d]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Donations</span>
            </button>
            {onOpenCornerAI && (
              <button
                id="top-nav-ai-pandit"
                onClick={onOpenCornerAI}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-[#ffb77a] hover:text-[#ffd799] hover:bg-[#3d1810] border border-[#ff9933]/30 transition-all cursor-pointer"
                title="Open AI Spiritual Guide in Corner"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ff9933] animate-pulse" />
                <span>AI Pandit</span>
              </button>
            )}

            <button
              id="top-nav-admin"
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#ffd799] text-[#3b1900] shadow-sm shadow-[#ffd799]/30 font-bold'
                  : 'text-[#887364] hover:text-[#c9b4a4] hover:bg-[#34130d]'
              }`}
              title="Admin Console"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            
          </nav>
        )}

        {/* Right: Actions (Language switcher, Flower toggle, Opacity & Notifications) */}
        <div className="flex items-center gap-2 relative shrink-0">
          {/* Language Selector Pill */}
          <div className="relative">
            <button
              id="language-selector-button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#270e0a] hover:bg-[#34130e] border border-[#ff9933]/40 text-[#f6e4d2] text-xs font-semibold tracking-wider transition-colors"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#ff9933]" />
              <span>{currentLanguage.toUpperCase()}</span>
            </button>

            {/* Language dropdown menu */}
            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#200a07] border border-[#ff9933]/40 shadow-xl shadow-black/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#ff9933]/70 tracking-wider">
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setShowLangMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#f6e4d2] hover:bg-[#32120c] transition-colors"
                    >
                      <span className="font-medium">
                        {lang.label} <span className="text-[11px] text-[#ff9933]/80">({lang.native})</span>
                      </span>
                      {currentLanguage === lang.code && (
                        <Check className="w-3.5 h-3.5 text-[#ff9933]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Jasmine Flower Shower (Pushpa Vrishti) Toggle */}
          {onToggleFlowerShower && (
            <button
              id="jasmine-shower-button"
              onClick={onToggleFlowerShower}
              title={isFlowerShowerActive ? 'Pause Jasmine Flower Shower' : 'Start Jasmine Flower Shower'}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                isFlowerShowerActive
                  ? 'bg-[#3d1810] border-[#ff9933] text-[#ffd799] shadow-sm shadow-[#ff9933]/20'
                  : 'bg-[#270e0a] hover:bg-[#34130e] border-[#552018] text-[#887063]'
              }`}
              aria-label="Toggle Jasmine Flower Shower"
            >
              <Flower2 className={`w-4 h-4 ${isFlowerShowerActive ? 'animate-pulse text-[#ffea79]' : ''}`} />
            </button>
          )}

          {/* Temple Maroon Wallpaper Opacity Adjuster */}
          {onBgOpacityChange && (
            <div className="relative">
              <button
                id="wallpaper-adjust-button"
                onClick={() => setShowAdjuster(!showAdjuster)}
                title="Adjust Temple Backdrop Transparency"
                className="w-9 h-9 rounded-full bg-[#270e0a] hover:bg-[#34130e] border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933] transition-colors cursor-pointer"
                aria-label="Adjust Backdrop Transparency"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Adjuster Popover */}
              {showAdjuster && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAdjuster(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1e0a07] border border-[#ff9933]/50 shadow-2xl shadow-black/95 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#f6e4d2]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff9933]" />
                        <span className="text-xs font-bold text-[#fff5ea]">
                          Backdrop Wallpaper
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#ff9933] bg-[#2a0e0a] px-2 py-0.5 rounded-full border border-[#ff9933]/30">
                        {Math.round(bgOpacity * 100)}%
                      </span>
                    </div>

                    <p className="text-[10px] text-[#a89080] mb-2.5">
                      Adjust opacity of the maroon temple backdrop
                    </p>

                    {/* Range Slider */}
                    <input
                      type="range"
                      min="0.10"
                      max="0.90"
                      step="0.05"
                      value={bgOpacity}
                      onChange={(e) => onBgOpacityChange(parseFloat(e.target.value))}
                      className="w-full accent-[#ff9933] cursor-pointer mb-3"
                    />

                    {/* Quick Presets */}
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: 'Soft', val: 0.2 },
                        { label: '40%', val: 0.4 },
                        { label: 'Vivid', val: 0.65 },
                        { label: 'Rich', val: 0.85 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => onBgOpacityChange(preset.val)}
                          className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                            Math.abs(bgOpacity - preset.val) < 0.05
                              ? 'bg-[#ff9933] text-[#331400] font-bold'
                              : 'bg-[#270e0a] hover:bg-[#38140e] text-[#c9b4a4] border border-[#441810]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bell Notifications */}
          <button
            id="notifications-button"
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full bg-[#270e0a] hover:bg-[#34130e] border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933] transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#fe624e] ring-2 ring-[#270e0a] animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
