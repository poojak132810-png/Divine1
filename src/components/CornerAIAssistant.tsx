import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Volume2, VolumeX, MessageSquare, Minimize2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { playChime } from '../utils/audio';

interface CornerAIAssistantProps {
  currentLanguage: LanguageCode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const WELCOME_MESSAGES: Record<string, string> = {
  kn: 'ಹರಿ ಓಂ! ನಾನು ಆಚಾರ್ಯ ವಿದ್ಯಾಧರ್, ನಿಮ್ಮ ದೇವಸ್ಥಾನದ ಧರ್ಮ ಮಾರ್ಗದರ್ಶಿ. ಆರತಿ, ಪಂಚಾಂಗ ಅಥವಾ ಹಬ್ಬಗಳ ಬಗ್ಗೆ ನೀವು ನನ್ನನ್ನು ಕೇಳಬಹುದು.',
  sa: 'हरिः ॐ! स्वागतम्। अहं आचार्यः विद्याधरः। नित्यपूजा, पञ्चಾङ्गमुಹूर्ताः विषये मां पृच्छतु।',
  en: 'Hari Om! I am Acharya Vidyadhar, your temple spiritual guide. Feel free to ask about aartis, panchang, or festival vidhis.',
};

const SUGGESTIONS_BY_LANG: Record<string, string[]> = {
  kn: [
    'ಶೃಂಗಾರ ಆರತಿಯ ಮಹತ್ವವೇನು?',
    'ಇಂದಿನ ಶುಭ ಮುಹೂರ್ತಗಳು ಯಾವುವು?',
    'ದೀಪಾವಳಿ ದೀಪೋತ್ಸವ ಸೇವೆ ವಿವರ?',
  ],
  sa: [
    'शृङ्गारारार्तिक्यस्य किं माहात्म्यम्?',
    'अद्यतनपञ्चाङ्गे के शुभमुहूर्ताः?',
  ],
  en: [
    'Significance of Shringar Aarti?',
    "Today's auspicious Muhurtas?",
    'Maha Mrityunjaya Mantra meaning?',
  ],
};

export const CornerAIAssistant: React.FC<CornerAIAssistantProps> = ({
  currentLanguage,
  isOpen,
  onToggle,
  onClose,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-corner',
      role: 'assistant',
      content: WELCOME_MESSAGES[currentLanguage] || WELCOME_MESSAGES.en,
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-corner') {
        return [
          {
            id: 'welcome-corner',
            role: 'assistant',
            content: WELCOME_MESSAGES[currentLanguage] || WELCOME_MESSAGES.en,
            timestamp: 'Now',
          },
        ];
      }
      return prev;
    });
  }, [currentLanguage]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-corner')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/pandit-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          language: currentLanguage,
        }),
      });

      const data = await res.json();
      const botReply = data.reply || 'May Bhagwan bless your spiritual path.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (soundEnabled) {
        playChime();
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Hari Om! Please ask again shortly.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Corner Button (Visible on desktop & tablet screens) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 hidden md:block animate-in fade-in zoom-in duration-200">
          <button
            id="corner-ai-pandit-btn"
            onClick={onToggle}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#ff9933] via-[#e67300] to-[#cc5200] text-[#2c1000] font-bold text-sm shadow-xl shadow-[#ff9933]/30 hover:shadow-2xl hover:shadow-[#ff9933]/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-[#ffd799]/60 cursor-pointer"
            aria-label="Open AI Pandit Spiritual Assistant"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-[#2c1000] animate-spin-slow" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
            </div>
            <span className="tracking-wide font-serif">Dharma AI Pandit</span>
          </button>
        </div>
      )}

      {/* Floating Corner Chat Window (Desktop) */}
      {isOpen && (
        <div
          id="corner-ai-chat-window"
          className="fixed bottom-6 right-6 z-50 hidden md:flex flex-col w-[380px] h-[520px] rounded-2xl bg-[#170705]/98 border border-[#ff9933]/50 shadow-2xl shadow-black/90 backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#250d09] border-b border-[#441810]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ff9933] flex items-center justify-center text-[#2c1000] shadow-md shadow-[#ff9933]/20">
                <Bot className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-playfair text-sm font-bold text-[#fef2e6] flex items-center gap-1.5">
                  Acharya Vidyadhar
                  <span className="text-[10px] font-sans font-medium text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </h3>
                <p className="text-[10px] text-[#ff9933]/90">Vedic Spiritual Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 rounded-lg hover:bg-[#38140e] text-[#bda292] hover:text-[#ff9933] transition-colors"
                title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[#38140e] text-[#bda292] hover:text-[#fff] transition-colors"
                title="Minimize / Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-1.5 bg-[#1b0806] border-b border-[#3c150e] flex gap-1.5 overflow-x-auto scrollbar-none">
            {(SUGGESTIONS_BY_LANG[currentLanguage] || SUGGESTIONS_BY_LANG.en).map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-[#2a0e0a] hover:bg-[#3d160f] border border-[#ff9933]/30 text-[#ecd6c3] whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-[#441810]">
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-[#ff9933]/20 border border-[#ff9933]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#ff9933]">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-[#230d09] border border-[#ff9933]/30 text-[#f5e3d3]'
                        : 'bg-gradient-to-r from-[#ff9933] to-[#e67300] text-[#2c1000] font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <span
                      className={`block text-[9px] mt-1 ${
                        isAssistant ? 'text-[#a18878]' : 'text-[#502400]'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-[#3d1810] flex items-center justify-center shrink-0 mt-0.5 text-[#ffd799]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#ffb77a] italic p-2 bg-[#220c08] rounded-xl border border-[#ff9933]/20 w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#ff9933]" />
                Acharya is contemplating the scriptures...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-2.5 bg-[#200b08] border-t border-[#441810]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about puja, aartis, mantras..."
                className="flex-1 bg-[#150504] border border-[#521e14] focus:border-[#ff9933] rounded-xl px-3 py-2 text-xs text-[#fff] placeholder-[#8d7568] focus:outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-[#ff9933] hover:bg-[#ffa64d] disabled:opacity-40 text-[#2c1000] font-bold transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
