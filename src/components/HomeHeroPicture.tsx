import React from 'react';
import { Flower2, Sparkles, HeartHandshake, Clock } from 'lucide-react';
import darshanImg from '../assets/images/sanctum_darshan_1788502241290.jpg';
import { LanguageCode } from '../types';

interface HomeHeroPictureProps {
  currentLanguage: LanguageCode;
  onOfferFlowers: () => void;
  onMakeOffering: () => void;
  onViewTimings: () => void;
}

const TEXTS: Record<string, {
  pill: string;
  title: string;
  subtitle: string;
  btnFlowers: string;
  btnOffering: string;
  btnTimings: string;
}> = {
  kn: {
    pill: 'ಪವಿತ್ರ ಗರ್ಭಗುಡಿ',
    title: 'ಶ್ರೀ ದೈವಿಕ ದರ್ಶನ',
    subtitle: 'ನಿತ್ಯ ದಿವ್ಯ ಪುಷ್ಪಾಲಂಕಾರ ಹಾಗೂ ಮಂಗಳ ಸನ್ನಿಧಾನ',
    btnFlowers: 'ಪುಷ್ಪಾರ್ಪಣೆ',
    btnOffering: 'ಕಾಣಿಕೆ ಸೇವೆ',
    btnTimings: 'ದರ್ಶನ ಸಮಯ',
  },
  hi: {
    pill: 'पवित्र गर्भगृह',
    title: 'दिव्य विग्रह दर्शन',
    subtitle: 'नित्य पावन पुष्प शृंगार एवं भगवत्कृपा सानिध्य',
    btnFlowers: 'पुष्प अर्पण',
    btnOffering: 'दान / सेवा',
    btnTimings: 'दर्शन समय',
  },
  sa: {
    pill: 'पवित्र गर्भगृहम्',
    title: 'दिव्य विग्रह दर्शनम्',
    subtitle: 'नित्य दिव्य पुष्पाभास शृङ्गार अनुग्रहः',
    btnFlowers: 'पुष्पार्पणम्',
    btnOffering: 'सेवा समर्पणम्',
    btnTimings: 'दर्शन समयः',
  },
  te: {
    pill: 'పవిత్ర గర్భగుడి',
    title: 'దివ్య విగ్రహ దర్శనం',
    subtitle: 'నిత్య దివ్య పుష్పాలంకరణ మరియు దివ్యానుగ్రహం',
    btnFlowers: 'పుష్పార్పణ',
    btnOffering: 'కానుక సేవ',
    btnTimings: 'దర్శన సమయాలు',
  },
  ta: {
    pill: 'புனித கருவறை',
    title: 'தெய்வீக தரிசனம்',
    subtitle: 'தினசரி மலர் அலங்காரம் மற்றும் அருளாசி',
    btnFlowers: 'மலரஞ்சலி',
    btnOffering: 'காணிக்கை',
    btnTimings: 'தரிசன நேரம்',
  },
  en: {
    pill: 'Sanctum Sanctorum',
    title: 'Sacred Garbhagriha Darshan',
    subtitle: 'Adorned in golden silks, fragrant jasmine & divine aura',
    btnFlowers: 'Offer Flowers',
    btnOffering: 'Hundi Offering',
    btnTimings: 'Temple Timings',
  },
};

export const HomeHeroPicture: React.FC<HomeHeroPictureProps> = ({
  currentLanguage,
  onOfferFlowers,
  onMakeOffering,
  onViewTimings,
}) => {
  const content = TEXTS[currentLanguage] || TEXTS.en;

  return (
    <div
      id="home-sacred-picture-card"
      className="relative rounded-2xl overflow-hidden border border-[#ff9933]/45 bg-[#1b0806] shadow-2xl shadow-black/85 mb-4 group ring-1 ring-[#ff9933]/20"
    >
      {/* Sacred Sanctum Image Container */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
        <img
          src={darshanImg}
          alt="Sacred Temple Sanctum Sanctorum Deity"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b0806] via-[#1b0806]/35 to-black/50 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#ff9933]/40 text-[#fdf4ea] text-[11px] font-medium tracking-wide shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#ff9933]" />
            <span>{content.pill}</span>
          </div>

          <button
            onClick={onViewTimings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2a0e0a]/80 backdrop-blur-md border border-[#ff9933]/30 text-[#ffd799] text-[11px] font-medium hover:bg-[#3d160f] transition-colors cursor-pointer"
          >
            <Clock className="w-3 h-3 text-[#ff9933]" />
            <span>{content.btnTimings}</span>
          </button>
        </div>

        {/* Bottom Title & Subtitle inside image */}
        <div className="absolute bottom-3 inset-x-3.5 z-10">
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#fff7ee] tracking-tight drop-shadow-md leading-tight">
            {content.title}
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#edd5c4] font-medium drop-shadow-sm mt-0.5 line-clamp-1">
            {content.subtitle}
          </p>
        </div>
      </div>

      {/* Devotional Action Buttons (Non-live) */}
      <div className="p-3 sm:p-3.5 bg-[#190705] border-t border-[#3b150f] grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Flower Offering Button */}
        <button
          id="btn-offer-flowers-hero"
          onClick={onOfferFlowers}
          className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-[#ff9933] via-[#ffaa4d] to-[#e67300] hover:from-[#ffa84d] hover:to-[#ff8000] active:scale-[0.98] text-[#2e1200] font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#ff9933]/25 transition-all cursor-pointer"
        >
          <Flower2 className="w-4 h-4 text-[#2e1200] animate-bounce-subtle" />
          <span>{content.btnFlowers}</span>
        </button>

        {/* Hundi / Seva Offering Button */}
        <button
          id="btn-hundi-offering-hero"
          onClick={onMakeOffering}
          className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-[#260c09] hover:bg-[#35120d] active:scale-[0.98] border border-[#5c2117] text-[#f7e8db] font-semibold text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-sm"
        >
          <HeartHandshake className="w-4 h-4 text-[#fe624e]" />
          <span>{content.btnOffering}</span>
        </button>
      </div>
    </div>
  );
};
