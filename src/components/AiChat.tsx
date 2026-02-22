import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

// **bold** textni render qilish
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

const DEFAULT_MESSAGE: Message = {
  id: 0,
  text: "Salom! Men Mukammal Ota Ona AI yordamchisiman. Farzand tarbiyasi bo'yicha savollaringizga javob beraman. 😊",
  isUser: false
};

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tarixni yuklash
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadHistory();
    }
  }, [isOpen, historyLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await aiAPI.getHistory();
      if (res.data.messages && res.data.messages.length > 0) {
        const loadedMessages: Message[] = res.data.messages.map((m: any, i: number) => ({
          id: i,
          text: m.content,
          isUser: m.role === 'user'
        }));
        setMessages(loadedMessages);
      }
      setHistoryLoaded(true);
    } catch {
      setHistoryLoaded(true);
    }
  };

  const clearHistory = async () => {
    try {
      await aiAPI.clearHistory();
      setMessages([DEFAULT_MESSAGE]);
    } catch {
      console.error('Tarixni tozalashda xatolik');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(input);
      const aiMessage: Message = { id: Date.now() + 1, text: res.data.message, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Kechirasiz, xatolik yuz berdi. Qaytadan urinib ko'ring.", isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button with Ripple Effect */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Ripple rings */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 w-14 h-14 rounded-full bg-sky-400 animate-ping opacity-30"></span>
            <span className="absolute inset-0 w-14 h-14 rounded-full bg-sky-400 animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></span>
          </>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden ${
            isOpen ? 'bg-slate-600 rotate-90' : 'hover:scale-110'
          }`}
        >
          {isOpen ? (
            <span className="material-symbols-outlined text-white text-3xl">close</span>
          ) : (
            <img src="/uploads/ai.jpg" alt="AI" className="w-full h-full object-cover" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src="/uploads/ai.jpg" alt="AI" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">AI Yordamchi</h3>
              <p className="text-emerald-100 text-xs">Farzand tarbiyasi bo'yicha</p>
            </div>
            {/* Clear button */}
            <button
              onClick={clearHistory}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Tarixni tozalash"
            >
              <span className="material-symbols-outlined text-xl">delete_sweep</span>
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.isUser 
                    ? 'bg-emerald-500 text-white rounded-br-md' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md'
                }`}>
                  {msg.isUser ? msg.text : renderText(msg.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Savolingizni yozing..."
                className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 rounded-xl flex items-center justify-center text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
