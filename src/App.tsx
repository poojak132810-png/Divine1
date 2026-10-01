import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomeHeroPicture } from './components/HomeHeroPicture';
import { CornerAIAssistant } from './components/CornerAIAssistant';
import { TodaySchedule } from './components/TodaySchedule';
import { UpcomingFestivals } from './components/UpcomingFestivals';
import { QuickServices } from './components/QuickServices';
import { BottomNav } from './components/BottomNav';
import { TempleTimingsModal } from './components/TempleTimingsModal';
import { DailyPanchangModal } from './components/DailyPanchangModal';
import { AartiDetailModal } from './components/AartiDetailModal';
import { FestivalDetailModal } from './components/FestivalDetailModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { JasmineShower } from './components/JasmineShower';
import { ShlokasScreen } from './screens/ShlokasScreen';
import { BookingsScreen } from './screens/BookingsScreen';
import { DonationsScreen } from './screens/DonationsScreen';
import { AIAssistantScreen } from './screens/AIAssistantScreen';
import { AdminScreen } from './screens/AdminScreen';
import { TODAY_AARTIS, UPCOMING_FESTIVALS, TEMPLE_SEVAS } from './data/templeData';
import { TrustBadges } from './components/TrustBadges';
import { TodaySevaBoard } from './components/TodaySevaBoard';
import { SevaPreviewCards } from './components/SevaPreviewCards';
import { MemberVerifyScreen } from './screens/MemberVerifyScreen';
import { TabType, LanguageCode, AartiScheduleItem, FestivalItem } from './types';
import templeMaroonExpandedImg from './assets/images/temple_maroon_expanded_1788503278889.jpg';
import templeMaroonMobileImg from './assets/images/temple_maroon_mobile_1788503296097.jpg';
import { ScannerScreen } from './components/ScannerScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(()=>
    new URLSearchParams(window.location.search).get('tab')==='admin'?'admin' : 'home' 
);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  // Check if this is a public member-verification link (?verify=TMP-2026-0001)
  const urlParams = new URLSearchParams(window.location.search);
  const verifyId = urlParams.get('verify');
  const isScannerRoute = new URLSearchParams(window.location.search).get('scan') === '1';
  // Modal dialog states
  const [isCornerAIOpen, setIsCornerAIOpen] = useState(false);
  const [isTimingsOpen, setIsTimingsOpen] = useState(false);
  const [isPanchangOpen, setIsPanchangOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFlowerShowerActive, setIsFlowerShowerActive] = useState(true);
  const [bgOpacity, setBgOpacity] = useState<number>(0.30);
  const [selectedAarti, setSelectedAarti] = useState<AartiScheduleItem | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<FestivalItem | null>(null);

  // Cross-navigation context
  const [bookingsInitialSevaId, setBookingsInitialSevaId] = useState<string | null>(null);
  const [donationsInitialCauseId, setDonationsInitialCauseId] = useState<string | null>(null);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | undefined>(undefined);

  // Handlers
  const handleOpenSevaBooking = (sevaId?: string) => {
    setBookingsInitialSevaId(sevaId || null);
    setActiveTab('bookings');
  };

  const handleOpenOffering = (causeId?: string) => {
    setDonationsInitialCauseId(causeId || null);
    setActiveTab('donations');
  };

  const handleConsultPandit = (query: string) => {
    setAiInitialQuery(query);
    // If on desktop, open the corner assistant seamlessly; on mobile switch tab
    if (window.innerWidth >= 768) {
      setIsCornerAIOpen(true);
    } else {
      setActiveTab('ai');
    }
  };

  const handleFestivalBooking = (festival: FestivalItem) => {
    setSelectedFestival(null);
    setBookingsInitialSevaId('archana');
    setActiveTab('bookings');
  };

  // Public member-verification page bypasses the entire normal app
  if (verifyId) {
    return <MemberVerifyScreen memberNumber={verifyId} />;
  }
  if (isScannerRoute) {
    return <ScannerScreen />;
  }
  return (
       <div className="min-h-screen w-full overflow-x-hidden  bg-[#120504] text-[#f8ede3] flex flex-col selection:bg-[#ff9933] selection:text-[#1a0a08] relative">
      {/* Expanded Sacred Temple Maroon Background with Adjustable Transparency */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <picture className="w-full h-full">
            <source
            media="(min-width: 768px)"
            srcSet={templeMaroonExpandedImg}
          />
          <img
            src={templeMaroonMobileImg}
            alt="Sacred Temple Sanctuary Maroon Decor"
            className="w-full h-full object-cover object-center transition-opacity duration-300 transform scale-100"
            style={{ opacity: bgOpacity }}
            referrerPolicy="no-referrer"
          />
        </picture>
        {/* Soft dark vignette & warm tint overlay for crystal-clear readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#120504]/70 via-[#160605]/35 to-[#120504]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[#120504]/25 pointer-events-none" />
      </div>

      {/* Centered Content Column Backlight / Vignette to ensure content is strongly highlighted */}
      <div className="fixed inset-0 pointer-events-none flex justify-center z-0">
        <div className="w-full max-w-2xl h-full bg-gradient-to-b from-[#150604]/70 via-[#170705]/50 to-[#150604]/80 backdrop-blur-[1px] shadow-2xl" />
      </div>

      {/* Background Sacred Geometric & Warm Glow Aura */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ff9933]/15 via-[#b22b1d]/5 to-transparent" />

      {/* Sacred Falling Jasmine Flowers Cascade */}
      <JasmineShower isActive={isFlowerShowerActive} />

      {/* Persistent Temple Header with Desktop Navigation (Home, Bookings, Donations) */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        isFlowerShowerActive={isFlowerShowerActive}
        onToggleFlowerShower={() => setIsFlowerShowerActive(!isFlowerShowerActive)}
        bgOpacity={bgOpacity}
        onBgOpacityChange={setBgOpacity}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCornerAI={() => setIsCornerAIOpen(true)}
      />

      {/* Main Content Area - responsive layout */}
      <main className="relative z-20 flex-1 w-full max-w-lg md:max-w-xl mx-auto px-4 pt-3 sm:pt-4">
        {activeTab === 'home' && (
          <div className="pb-24 animate-in fade-in duration-200">
            {/* Sacred Sanctum Deity Picture on Home Page */}
            <HomeHeroPicture
              currentLanguage={currentLanguage}
              onOfferFlowers={() => setIsFlowerShowerActive(true)}
              onMakeOffering={() => handleOpenOffering('hundi')}
              onViewTimings={() => setIsTimingsOpen(true)}
            />

            <TodaySevaBoard sevas={TEMPLE_SEVAS} />

            <SevaPreviewCards
              sevas={TEMPLE_SEVAS}
              onBookSeva={(sevaId) => handleOpenSevaBooking(sevaId)}
              onViewAll={() => setActiveTab('bookings')}
            />

            <TrustBadges />

            {/* 1. Today's Schedule (Mangala, Shringar, Sandhya, Shayan) */}
            <TodaySchedule
              aartis={TODAY_AARTIS}
              onViewAll={() => setSelectedAarti(TODAY_AARTIS[1])}
              onSelectAarti={(aarti) => setSelectedAarti(aarti)}
            />

            {/* 2. Quick Devotional Services (2x2 Grid + Shlokas Card) */}
            <QuickServices
              onOpenTimings={() => setIsTimingsOpen(true)}
              onOpenBookings={() => handleOpenSevaBooking()}
              onOpenOfferings={() => handleOpenOffering('hundi')}
              onOpenPanchang={() => setIsPanchangOpen(true)}
              onOpenShlokas={() => setActiveTab('shlokas')}
            />

            {/* 3. Upcoming Festivals (Diwali Mahotsav) */}
            <UpcomingFestivals
              festival={UPCOMING_FESTIVALS[0]}
              onViewDetails={(f) => setSelectedFestival(f)}
            />
          </div>
        )}

        {activeTab === 'shlokas' && (
          <div className="animate-in fade-in duration-200 pb-20">
            <ShlokasScreen currentLanguage={currentLanguage} />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="animate-in fade-in duration-200 pb-20">
            <BookingsScreen initialSevaId={bookingsInitialSevaId} />
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="animate-in fade-in duration-200 pb-20">
            <DonationsScreen initialCauseId={donationsInitialCauseId} />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="animate-in fade-in duration-200 pb-20">
            <AIAssistantScreen
              currentLanguage={currentLanguage}
              initialQuery={aiInitialQuery}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-200 pb-20">
            <AdminScreen />
          </div>
        )}
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating Corner AI Pandit Widget for Website/Desktop */}
      <CornerAIAssistant
        currentLanguage={currentLanguage}
        isOpen={isCornerAIOpen}
        onToggle={() => setIsCornerAIOpen(!isCornerAIOpen)}
        onClose={() => setIsCornerAIOpen(false)}
        initialQuery={aiInitialQuery}
      />

      {/* Interactive Modals and Drawers */}
      <TempleTimingsModal
        isOpen={isTimingsOpen}
        onClose={() => setIsTimingsOpen(false)}
        onBookSeva={() => {
          setIsTimingsOpen(false);
          handleOpenSevaBooking('vip-darshan');
        }}
      />

      <DailyPanchangModal
        isOpen={isPanchangOpen}
        onClose={() => setIsPanchangOpen(false)}
        onConsultPandit={(q) => {
          setIsPanchangOpen(false);
          handleConsultPandit(q);
        }}
      />

      <AartiDetailModal
        aarti={selectedAarti}
        isOpen={Boolean(selectedAarti)}
        onClose={() => setSelectedAarti(null)}
      />

      <FestivalDetailModal
        festival={selectedFestival}
        isOpen={Boolean(selectedFestival)}
        onClose={() => setSelectedFestival(null)}
        onBookFestivalSeva={handleFestivalBooking}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onViewSchedule={() => {
          setIsNotificationsOpen(false);
          setSelectedAarti(TODAY_AARTIS[1]);
        }}
      />
       </div>
  );
}