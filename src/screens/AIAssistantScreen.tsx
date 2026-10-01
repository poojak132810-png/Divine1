import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, BookOpen, RefreshCw } from 'lucide-react';
import { ChatMessage, LanguageCode } from '../types';
import { playChime } from '../utils/audio';

interface AIAssistantScreenProps {
  currentLanguage: LanguageCode;
  initialQuery?: string;
}

const SUGGESTIONS_BY_LANG: Record<string, string[]> = {
  kn: [
    'ಶೃಂಗಾರ ಆರತಿಯ ಆಧ್ಯಾತ್ಮಿಕ ಮಹತ್ವವೇನು?',
    'ಇಂದಿನ ಪಂಚಾಂಗದ ಶುಭ ಮುಹೂರ್ತಗಳು ಯಾವುವು?',
    'ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರದ ಅರ್ಥ ತಿಳಿಸಿ',
    'ದೀಪಾವಳಿಯಲ್ಲಿ ದೀಪೋತ್ಸವ ಸೇವೆಯ ಮಹತ್ವವೇನು?',
    'ಮನೆಯಲ್ಲಿ ಸರಳ ಶಿವಪೂಜೆ ಮಾಡುವ ವಿಧಾನವೇನು?',
  ],
  sa: [
    'शृङ्गारारार्तिक्यस्य किं माहात्म्यम्?',
    'अद्यतनपञ्चाङ्गे के शुभमुहूर्ताः?',
    'महामृत्युंजयमन्त्रस्य अर्थः कथम्?',
    'दीपावल्यां दीपोत्सवसेवायाः महत्त्वं किं?',
  ],
  en: [
    'What is the spiritual significance of Shringar Aarti?',
    "What are today's auspicious panchang muhurtas?",
    'Explain the meaning of the Maha Mrityunjaya Mantra',
    'What is the significance of Deepotsava seva in Diwali?',
    'How to perform a simple Shiva puja at home?',
  ],
};

const WELCOME_MESSAGES: Record<string, string> = {
  kn: 'ಹರಿ ಓಂ! ಭಕ್ತರಿಗೆ ಸುಸ್ವಾಗತ. ನಾನು ಆಚಾರ್ಯ ವಿದ್ಯಾಧರ್, ನಿಮ್ಮ ದೇವಸ್ಥಾನದ ಧರ್ಮ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶಿ.\n\nದೈನಂದಿನ ದೇವಸ್ಥಾನದ ಆರತಿಗಳು, ಶುಭ ಪಂಚಾಂಗ ಮುಹೂರ್ತಗಳು, ಹಬ್ಬಗಳ ಮಹತ್ವ, ಮಂತ್ರಗಳ ಅರ್ಥ ಅಥವಾ ಪೂಜಾ ವಿಧಿಗಳ ಬಗ್ಗೆ ನೀವು ನನ್ನನ್ನು ಕೇಳಬಹುದು. ಇಂದು ನಾನು ನಿಮ್ಮ ಭಕ್ತಿಸೇವೆಯಲ್ಲಿ ಹೇಗೆ ನೆರವಾಗಲಿ?',
  sa: 'हरिः ॐ! स्वागतम्। अहं आचार्यः विद्याधरः, भवतः मन्दिरस्य आध्यात्मिकमार्गदर्शकः च।\n\nभवान् मम पृच्छतु यथा प्रतिदिनं मन्दिरस्य आरती, शुभपञ्चाङ्गमुहूर्ताः, उत्सवस्य महत्त्वम्, मन्त्रार्थाः वा पूजाविधिः। अद्य अहं भवतः आध्यात्मिकभक्तिसेवायाम् कथं साहाय्यम् करोतु?',
  en: 'Hari Om! Welcome, devotee. I am Acharya Vidyadhar, your temple spiritual guide and Dharma assistant.\n\nYou may ask me about daily temple aartis, auspicious panchang muhurtas, festival significance, mantra meanings, or puja vidhi for your family. How may I assist your spiritual devotion today?',
};

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({
  currentLanguage,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGES[currentLanguage] || WELCOME_MESSAGES.en,
      timestamp: 'Today',
    },
  ]);
  const [input, setInput] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            role: 'assistant',
            content: WELCOME_MESSAGES[currentLanguage] || WELCOME_MESSAGES.en,
            timestamp: 'Today',
          },
        ];
      }
      return prev;
    });
  }, [currentLanguage]);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/pandit-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          language: currentLanguage,
        }),
      });

      const data = await res.json();
      const botReply = data.reply || 'May Bhagwan shower infinite grace on you.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      playChime();
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'Hari Om! Priests are currently preparing the inner sanctum. Please feel free to re-ask or consult our daily schedule.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-fresh',
        role: 'assistant',
        content: 'Hari Om! Chat cleared. What spiritual guidance or ritual question may I help you with?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#3b150f] mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#2a0e0a] border border-[#ff9933]/40 flex items-center justify-center text-[#ff9933] shadow-md shadow-[#ff9933]/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-playfair text-lg sm:text-xl font-bold text-[#fff5ea] flex items-center gap-1.5">
              Acharya Vidyadhar
              <span className="text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded-full bg-[#3d1810] text-[#ffb77a] border border-[#ff9933]/30">
                AI Pandit
              </span>
            </h1>
            <p className="text-[11px] text-[#ff9933]">Vedic Ritual & Dharma Spiritual Advisor</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Reset conversation"
          className="p-2 rounded-full bg-[#240b08] hover:bg-[#34110b] text-[#c9b4a4] hover:text-[#fff] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mb-3 scrollbar-none">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser
                    ? 'bg-[#3b140d] text-[#ff9933] border border-[#ff9933]/40'
                    : 'bg-[#ff9933] text-[#331400] font-bold shadow-md shadow-[#ff9933]/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#ff9933] text-[#331400] font-medium shadow'
                    : 'bg-[#1e0a07] border border-[#481a12] text-[#f6e4d2] shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                <span
                  className={`block text-[10px] mt-1.5 ${
                    isUser ? 'text-[#632900]' : 'text-[#887364]'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ff9933] text-[#331400] flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl p-3 bg-[#1e0a07] border border-[#481a12] text-xs text-[#ffb77a] flex items-center gap-2 shadow">
              <span className="w-2 h-2 rounded-full bg-[#ff9933] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#ff9933] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#ff9933] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 italic text-[11px]">Acharya is consulting the sacred texts...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries (Chips) */}
      <div className="mb-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[#ff9933] font-semibold mb-1.5">
          <BookOpen className="w-3 h-3" />
          <span>Devotional Inquiries</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(SUGGESTIONS_BY_LANG[currentLanguage] || SUGGESTIONS_BY_LANG.en).map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#220c08] hover:bg-[#34120c] border border-[#441810] hover:border-[#ff9933]/50 text-[11px] text-[#c9b4a4] hover:text-[#fff] transition-colors cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Acharya about mantras, aartis, panchang, or puja vidhi..."
          className="flex-1 rounded-xl bg-[#220c08] border border-[#481a12] focus:border-[#ff9933] focus:outline-none px-3.5 py-2.5 text-xs text-[#fff5ea] placeholder-[#887364]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#ff9933] hover:bg-[#ffaa4d] disabled:opacity-50 text-[#331400] font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
