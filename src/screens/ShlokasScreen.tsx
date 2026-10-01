import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Flame,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { SACRED_SHLOKAS } from '../data/shlokasData';
import { ShlokaItem, LanguageCode } from '../types';
import { playChime } from '../utils/audio';

interface ShlokasScreenProps {
  currentLanguage: LanguageCode;
}

type ScriptType = 'kannada' | 'sanskrit' | 'transliteration';

export const ShlokasScreen: React.FC<ShlokasScreenProps> = ({
  currentLanguage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scriptType, setScriptType] = useState<ScriptType>(
    currentLanguage === 'kn' ? 'kannada' : 'sanskrit'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active Japa Counter State
  const [activeJapaShloka, setActiveJapaShloka] = useState<ShlokaItem | null>(null);
  const [japaTarget, setJapaTarget] = useState<number>(11);
  const [japaCount, setJapaCount] = useState<number>(0);

  const categories = [
    { id: 'all', label: 'All Shlokas', kannada: 'ಎಲ್ಲವೂ' },
    { id: 'daily', label: 'Daily Prayers', kannada: 'ದೈನಂದಿನ' },
    { id: 'shiva', label: 'Lord Shiva', kannada: 'ಶಿವ' },
    { id: 'vishnu', label: 'Lord Vishnu', kannada: 'ವಿಷ್ಣು' },
    { id: 'devi', label: 'Goddess Devi', kannada: 'ದೇವಿ' },
    { id: 'ganesha', label: 'Lord Ganesha', kannada: 'ಗಣೇಶ' },
    { id: 'hanuman', label: 'Lord Hanuman', kannada: 'ಹನುಮಾನ್' },
    { id: 'shanti', label: 'Peace Mantras', kannada: 'ಶಾಂತಿ' },
  ];

  const filteredShlokas = SACRED_SHLOKAS.filter((shloka) => {
    const matchesCategory =
      selectedCategory === 'all' || shloka.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      shloka.title.toLowerCase().includes(query) ||
      shloka.deity.toLowerCase().includes(query) ||
      shloka.meaning.toLowerCase().includes(query) ||
      shloka.kannada.toLowerCase().includes(query) ||
      shloka.sanskrit.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (shloka: ShlokaItem) => {
    const textToCopy = `${shloka.title} (${shloka.deity})\n\n[Sanskrit]\n${shloka.sanskrit}\n\n[Kannada]\n${shloka.kannada}\n\n[Meaning]\n${shloka.meaning}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(shloka.id);
    playChime();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlaySound = () => {
    playChime();
  };

  const startJapa = (shloka: ShlokaItem) => {
    setActiveJapaShloka(shloka);
    setJapaCount(0);
    playChime();
  };

  const handleIncrementJapa = () => {
    const nextCount = japaCount + 1;
    setJapaCount(nextCount);
    playChime();
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#240c08] via-[#2f100a] to-[#240c08] border border-[#ff9933]/40 p-4 shadow-xl text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-[#ff9933]" />
          <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#fef5ee] tracking-tight">
            Sacred Shlokas & Mantras
          </h2>
        </div>
        <p className="text-xs text-[#ffb77a] font-serif">
          ॐ ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ • ನೈವೇದ್ಯ, ಜಪ ಮತ್ತು ನಿತ್ಯ ಸ್ತೋತ್ರಗಳು
        </p>
        <p className="text-[11px] text-[#c7b0a0] mt-1 max-w-md mx-auto">
          Immerse in timeless Vedic vibrations, sacred stotras, and guided Japa repetitions for inner peace and divine grace.
        </p>
      </div>

      {/* Controls: Search & Script Type Selector */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8f7566] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mantra, deity, or meaning..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1c0806] border border-[#441810] focus:border-[#ff9933] text-xs text-[#fef5ee] placeholder-[#8f7566] focus:outline-none transition-colors"
          />
        </div>

        {/* Script Selector Tabs */}
        <div className="flex items-center justify-center p-1 rounded-xl bg-[#1c0806] border border-[#441810] shrink-0 self-center sm:self-auto">
          <button
            onClick={() => setScriptType('kannada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scriptType === 'kannada'
                ? 'bg-[#ff9933] text-[#2c1000] shadow-sm font-bold'
                : 'text-[#c7b0a0] hover:text-[#fff]'
            }`}
          >
            ಕನ್ನಡ
          </button>
          <button
            onClick={() => setScriptType('sanskrit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scriptType === 'sanskrit'
                ? 'bg-[#ff9933] text-[#2c1000] shadow-sm font-bold'
                : 'text-[#c7b0a0] hover:text-[#fff]'
            }`}
          >
            संस्कृतम्
          </button>
          <button
            onClick={() => setScriptType('transliteration')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scriptType === 'transliteration'
                ? 'bg-[#ff9933] text-[#2c1000] shadow-sm font-bold'
                : 'text-[#c7b0a0] hover:text-[#fff]'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#ff9933] text-[#2a1000] font-bold shadow-md shadow-[#ff9933]/20 border border-[#ffd799]'
                  : 'bg-[#220c08] border border-[#441810] text-[#cbb5a4] hover:bg-[#30120b] hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              {currentLanguage === 'kn' && (
                <span className="opacity-80 text-[10px] ml-1">({cat.kannada})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Shlokas List */}
      <div className="space-y-3.5">
        {filteredShlokas.map((shloka) => {
          const isCopied = copiedId === shloka.id;
          return (
            <div
              key={shloka.id}
              id={`shloka-card-${shloka.id}`}
              className="rounded-2xl bg-[#1b0806]/95 border border-[#521e14] hover:border-[#ff9933]/60 transition-all p-4 shadow-xl shadow-black/60 relative group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#36130c] border border-[#ff9933]/30 text-[10px] font-bold text-[#ffb77a] uppercase tracking-wide">
                      {shloka.deity}
                    </span>
                    <span className="text-[10px] text-[#a89080]">
                      ⏰ {shloka.idealTime}
                    </span>
                  </div>
                  <h3 className="font-playfair text-base sm:text-lg font-bold text-[#fff4e8] mt-1">
                    {shloka.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Play Bell Chime */}
                  <button
                    onClick={handlePlaySound}
                    className="p-2 rounded-xl bg-[#260e0a] hover:bg-[#38140e] text-[#c9b4a4] hover:text-[#ff9933] transition-colors"
                    title="Play Sacred Temple Bell Chime"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Shloka */}
                  <button
                    onClick={() => handleCopy(shloka)}
                    className="p-2 rounded-xl bg-[#260e0a] hover:bg-[#38140e] text-[#c9b4a4] hover:text-[#ffd799] transition-colors"
                    title="Copy Shloka and Meaning"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Shloka Sacred Text Box */}
              <div className="p-3.5 rounded-xl bg-[#240c08] border border-[#ff9933]/25 text-center my-2.5 relative">
                <p className="font-serif text-sm sm:text-base text-[#fff2e2] leading-relaxed font-semibold whitespace-pre-line select-all">
                  {scriptType === 'kannada' && shloka.kannada}
                  {scriptType === 'sanskrit' && shloka.sanskrit}
                  {scriptType === 'transliteration' && shloka.transliteration}
                </p>
              </div>

              {/* English Meaning & Spiritual Significance */}
              <div className="mt-2.5 space-y-1.5 text-xs">
                <p className="text-[#f1ded0] leading-relaxed">
                  <span className="font-bold text-[#ffb77a]">Meaning: </span>
                  {shloka.meaning}
                </p>
                <p className="text-[#a89080] text-[11px] italic">
                  <span className="font-semibold text-[#ffd799]">Benefit: </span>
                  {shloka.significance}
                </p>
              </div>

              {/* Action: Start Japa Counter */}
              <div className="mt-3.5 pt-3 border-t border-[#3b150f] flex items-center justify-between">
                <span className="text-[11px] text-[#ff9933] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Daily Contemplation
                </span>

                <button
                  onClick={() => startJapa(shloka)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ff9933] to-[#e67300] hover:from-[#ffa84d] hover:to-[#ff8000] text-[#2a1000] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#ff9933]/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Flame className="w-3 h-3 fill-current" />
                  <span>Chant Japa</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredShlokas.length === 0 && (
          <div className="text-center py-12 bg-[#1b0806] rounded-2xl border border-[#441810] p-6">
            <BookOpen className="w-8 h-8 text-[#ff9933]/50 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#fff4e8]">No shlokas found</p>
            <p className="text-xs text-[#a89080] mt-1">Try another search keyword or select All Shlokas.</p>
          </div>
        )}
      </div>

      {/* Interactive Japa Counter Modal */}
      {activeJapaShloka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#1c0806] border border-[#ff9933]/50 shadow-2xl p-6 text-center relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#3b150f] mb-4">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider text-[#ff9933] font-bold">
                  Guided Japa Meditation
                </span>
                <h3 className="font-playfair text-base font-bold text-[#fff4e8]">
                  {activeJapaShloka.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveJapaShloka(null)}
                className="text-[#a89080] hover:text-white text-xs px-2.5 py-1 rounded-lg bg-[#290e0a]"
              >
                Close
              </button>
            </div>

            {/* Shloka Text to chant */}
            <div className="p-3 rounded-xl bg-[#250d09] border border-[#441810] mb-5 text-xs text-[#ffd799] font-serif leading-relaxed">
              {scriptType === 'kannada'
                ? activeJapaShloka.kannada
                : activeJapaShloka.sanskrit}
            </div>

            {/* Target Selector */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[11, 21, 54, 108].map((target) => (
                <button
                  key={target}
                  onClick={() => {
                    setJapaTarget(target);
                    setJapaCount(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    japaTarget === target
                      ? 'bg-[#ff9933] text-[#2c1000]'
                      : 'bg-[#280e09] text-[#a89080] hover:text-white'
                  }`}
                >
                  {target}x
                </button>
              ))}
            </div>

            {/* Big Tap Japa Button */}
            <div className="my-5">
              <button
                onClick={handleIncrementJapa}
                className={`w-32 h-32 mx-auto rounded-full flex flex-col items-center justify-center border-4 transition-all duration-150 active:scale-95 shadow-2xl cursor-pointer ${
                  japaCount >= japaTarget
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-emerald-500/30'
                    : 'bg-gradient-to-b from-[#ff9933] to-[#cc5200] border-[#ffd799] text-[#2c1000] shadow-[#ff9933]/30'
                }`}
              >
                {japaCount >= japaTarget ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 mb-1" />
                    <span className="text-xs font-bold">Completed!</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-black">{japaCount}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      Tap to Chant
                    </span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-[#a89080]">
              Progress: <span className="text-[#ff9933] font-bold">{japaCount}</span> of{' '}
              <span className="text-white font-bold">{japaTarget}</span> chants
            </p>

            {/* Reset Button */}
            <div className="mt-4 pt-3 border-t border-[#3b150f] flex items-center justify-center">
              <button
                onClick={() => setJapaCount(0)}
                className="flex items-center gap-1.5 text-xs text-[#a89080] hover:text-[#ff9933] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Count</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
