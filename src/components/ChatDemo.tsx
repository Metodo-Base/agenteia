import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Nicho } from '../types';

interface ChatDemoProps {
  nichos: Nicho[];
  isOpen: boolean;
  onClose: () => void;
  initialNicho?: string;
}

const ChatDemo = ({ nichos, isOpen, onClose, initialNicho }: ChatDemoProps) => {
  const [messages, setMessages] = useState<{ type: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedNicho, setSelectedNicho] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialNicho) {
      setSelectedNicho(initialNicho);
    } else if (nichos.length > 0 && !selectedNicho) {
      setSelectedNicho(nichos[0].slug);
    }
  }, [nichos, initialNicho]);

  useEffect(() => {
    if (selectedNicho) {
      const nicho = nichos.find(n => n.slug === selectedNicho);
      setMessages([
        { type: 'bot', text: `Olá! Eu sou o assistente virtual especializado em ${nicho?.nome_nicho || 'atendimento'}. Como posso te ajudar hoje?` }
      ]);
    }
  }, [selectedNicho, nichos]);

  if (!isOpen) return null;

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
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.response) {
          setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
        } else if (data.error) {
          setMessages(prev => [...prev, { type: 'bot', text: `Erro: ${data.error}` }]);
        } else {
          setMessages(prev => [...prev, { type: 'bot', text: 'Desculpe, ocorreu um erro ao processar sua mensagem.' }]);
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        setMessages(prev => [...prev, { type: 'bot', text: 'Erro: O servidor retornou uma resposta inválida (HTML). Verifique se as chaves de API estão configuradas.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Erro de conexão com o servidor.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[90vw] sm:w-[400px] group">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[70vh]"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Demonstração IA</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-blue-100 uppercase tracking-wider font-bold">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 hide-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.type === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 text-slate-400 p-3 rounded-2xl rounded-tl-none border border-white/10 text-xs flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-grow bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatDemo;
