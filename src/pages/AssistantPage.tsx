import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ChevronRight,
  MessageSquare,
  Layout,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface Nicho {
  id: string;
  nome_nicho: string;
  prompt_inicial: string;
  slug: string;
}

const AssistantPage = () => {
  const [nichos, setNichos] = useState<Nicho[]>([]);
  const [selectedNicho, setSelectedNicho] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ type: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const q = query(collection(db, 'nichos'), orderBy('nome_nicho'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nichosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Nicho[];
      setNichos(nichosData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedNicho) {
      const nicho = nichos.find(n => n.slug === selectedNicho);
      setMessages([
        { type: 'bot', text: `Olá! Eu sou o assistente virtual especializado em ${nicho?.nome_nicho || 'atendimento'}. Como posso te ajudar hoje?` }
      ]);
    }
  }, [selectedNicho, nichos]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !selectedNicho) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { type: 'user', text: userMessage }] as { type: 'user' | 'bot', text: string }[];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const nicho = nichos.find(n => n.slug === selectedNicho);
      const prompt = nicho?.prompt_inicial || "Você é um assistente prestativo.";

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slug: selectedNicho, 
          messages: newMessages,
          prompt: prompt 
        })
      });
      
      const data = await response.json();
      if (data.response) {
        setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'Desculpe, ocorreu um erro ao processar sua mensagem.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Erro de conexão com o servidor.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-lg hidden sm:block">Assistente IA</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Sistema Ativo</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col max-w-5xl mx-auto w-full p-4 gap-6">
        {/* Niche Selector */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Layout className="w-4 h-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Escolha o Nicho de Atendimento</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {nichos.map((nicho) => (
              <button
                key={nicho.id}
                onClick={() => {
                  setSelectedNicho(nicho.slug);
                  setMessages([]); // Reset chat when niche changes
                }}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 group ${
                  selectedNicho === nicho.slug
                    ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  selectedNicho === nicho.slug ? 'bg-white/20' : 'bg-blue-600/10 group-hover:bg-blue-600/20'
                }`}>
                  <Sparkles className={`w-5 h-5 ${selectedNicho === nicho.slug ? 'text-white' : 'text-blue-400'}`} />
                </div>
                <span className={`text-xs font-bold ${selectedNicho === nicho.slug ? 'text-white' : 'text-slate-300'}`}>
                  {nicho.nome_nicho}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Chat Area */}
        <section className="flex-grow flex flex-col bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden min-h-[500px] shadow-2xl">
          {!selectedNicho ? (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center animate-bounce">
                <MessageSquare className="w-10 h-10 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Pronto para começar?</h3>
                <p className="text-slate-400 max-w-xs mx-auto">
                  Selecione um dos nichos acima para iniciar uma conversa com nossa Inteligência Artificial especializada.
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                <span>Escolha um nicho acima</span>
                <ChevronRight className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6 hide-scrollbar">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                        msg.type === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20' 
                          : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/5 text-slate-400 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1.5">
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-slate-900/80 border-t border-white/10">
                <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Fale com o assistente de ${nichos.find(n => n.slug === selectedNicho)?.nome_nicho}...`}
                    className="w-full bg-slate-800 border border-white/10 rounded-2xl pl-6 pr-16 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-blue-600/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-bold">
                  Powered by AI Agent Technology
                </p>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default AssistantPage;
