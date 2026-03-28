import React, { useState } from 'react';
import { 
  Bot, 
  ArrowRight, 
  Clock, 
  UserX, 
  Smartphone, 
  Check, 
  Users, 
  Zap, 
  Crown, 
  X, 
  ChevronDown, 
  Star, 
  Send, 
  CheckCircle,
  TrendingUp,
  ClipboardCheck,
  Settings,
  Rocket,
  MessageCircle,
  Calendar,
  LayoutDashboard,
  BarChart3,
  Bell,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Nicho } from '../types';
import ChatDemo from '../components/ChatDemo';

// --- Helper Components ---

const Navbar = () => {
  return (
    <nav className="w-full px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center max-w-7xl mx-auto z-10">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Bot className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
        </div>
        <span className="font-bold text-lg sm:text-xl tracking-tight text-white">AI Agent</span>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          to="/assistente"
          className="hidden sm:flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 px-4 py-2 rounded-full transition-all text-sm font-bold border border-blue-500/20 text-blue-400"
        >
          <Sparkles className="w-4 h-4" />
          Demonstração Completa
        </Link>
        <a 
          href="https://wa.me/5532984963439?text=Olá. Gostaria de falar com um consultor" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition-all text-sm font-medium border border-white/10 text-white"
        >
          Falar com Consultor
        </a>
      </div>
    </nav>
  );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
  <details className="group glass-card rounded-2xl p-6 sm:p-8 cursor-pointer">
    <summary className="flex items-center justify-between font-bold text-base sm:text-lg text-slate-100 hover:text-blue-400 transition-colors list-none">
      <span>{question}</span>
      <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
    </summary>
    <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
      {answer}
    </p>
  </details>
);

const PricingCard = ({ 
  title, 
  price, 
  discounted, 
  features, 
  missing = [], 
  popular, 
  icon: Icon,
  buttonText = "Começar Agora",
  priceSuffix = "/mês"
}: any) => (
  <div className={`glass-card rounded-3xl p-6 sm:p-8 space-y-6 sm:space-y-8 flex flex-col transition-all relative ${
    popular 
    ? 'bg-gradient-to-br from-emerald-900/30 to-emerald-950/40 border-emerald-500/30 ring-2 ring-emerald-500/20 hover:ring-emerald-500/40 scale-100 md:scale-105 z-10' 
    : 'bg-slate-900 border-slate-700 hover:border-slate-600'
  }`}>
    {popular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-emerald-500 text-slate-900 px-4 py-1 rounded-full text-xs sm:text-sm font-bold">Mais Popular</span>
      </div>
    )}
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${popular ? 'bg-emerald-500/20' : 'bg-blue-500/10'}`}>
        <Icon className={`w-6 h-6 ${popular ? 'text-emerald-400' : 'text-blue-500'}`} />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
      </div>
    </div>
    <div className="space-y-2">
      <div className="text-3xl sm:text-4xl font-extrabold">
        {price}{priceSuffix && <span className="text-lg text-slate-400">{priceSuffix}</span>}
      </div>
      {discounted && (
        <div className="space-y-1">
          <p className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg inline-block">{discounted}</p>
        </div>
      )}
    </div>
    <div className={`border-t ${popular ? 'border-emerald-500/20' : 'border-slate-700'}`}></div>
    <ul className="space-y-3 sm:space-y-4 flex-grow">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-start gap-3">
          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${popular ? 'text-emerald-400' : 'text-blue-500'}`} />
          <span className="text-sm text-slate-300">{f}</span>
        </li>
      ))}
      {missing.map((f: string, i: number) => (
        <li key={i} className="flex items-start gap-3">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-slate-400">{f}</span>
        </li>
      ))}
    </ul>
    <a 
      href={`https://wa.me/5532984963439?text=${encodeURIComponent(`Olá. Gostaria de falar sobre o ${title}`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg text-center ${
      popular 
      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/30' 
      : 'bg-slate-800 hover:bg-slate-700 text-white'
    }`}>
      {buttonText}
    </a>
  </div>
);

const SetupCard = ({ title, price, focus, includes, icon: Icon, popular }: any) => (
  <div className={`glass-card rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col transition-all relative ${
    popular 
    ? 'bg-gradient-to-br from-blue-900/30 to-blue-950/40 border-blue-500/30 ring-2 ring-blue-500/20' 
    : 'bg-slate-900 border-slate-700'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${popular ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
        <Icon className={`w-6 h-6 ${popular ? 'text-blue-400' : 'text-slate-400'}`} />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <div className="space-y-2">
      <div className="text-2xl font-extrabold text-white">{price}</div>
      <div className="bg-blue-500/10 px-3 py-1.5 rounded-lg inline-block">
        <p className="text-xs sm:text-sm text-blue-400 font-bold uppercase tracking-wider">{focus}</p>
      </div>
    </div>
    <div className="border-t border-slate-700"></div>
    <div className="flex-grow">
      <p className="text-sm text-slate-400 leading-relaxed">
        <span className="text-slate-200 font-bold block mb-2">Inclui:</span>
        {includes}
      </p>
    </div>
    <a 
      href={`https://wa.me/5532984963439?text=${encodeURIComponent(`Olá. Gostaria de falar sobre o ${title}`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full py-4 rounded-xl font-bold text-center bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-500/20"
    >
      Falar com Consultor
    </a>
  </div>
);

interface LandingPageProps {
  nichos: Nicho[];
  user: any;
  isAdmin: boolean;
  handleLogin: () => void;
  handleLogout: () => void;
  handleAdminToggle: () => void;
  handleSeed: () => void;
  isSeeding: boolean;
  view: 'landing' | 'admin';
}

const LandingPage = ({ 
  nichos, 
  user, 
  isAdmin, 
  handleLogin, 
  handleLogout, 
  handleAdminToggle, 
  handleSeed, 
  isSeeding,
  view
}: LandingPageProps) => {
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatNicho, setChatNicho] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const nome = formData.get('nome') as string;
    const email = formData.get('email') as string;
    const whatsapp = formData.get('whatsapp') as string;

    try {
      await addDoc(collection(db, 'leads'), {
        nome,
        email,
        whatsapp,
        createdAt: Timestamp.now()
      });
      setFormStatus('success');
    } catch (error) {
      setFormStatus('error');
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-14 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 sm:px-4 py-1 rounded-full text-blue-400 text-xs sm:text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              IA Ativa agora no WhatsApp
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              Atenda, Qualifique e Agende enquanto você dorme.
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
              Pare de perder pacientes por demora no WhatsApp. Nosso agente de IA faz o atendimento humano, qualifica leads e agenda consultas direto no seu calendário 24h por dia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://wa.me/5532984963439?text=Olá. Gostaria de saber mais sobre o Agente de IA" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 min-h-14 flex-grow sm:flex-grow-0"
              >
                Quero meu Agente de IA <ArrowRight className="w-5 h-5 hidden sm:inline" />
              </a>
              <Link 
                to="/assistente"
                className="bg-white/5 hover:bg-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-center transition-all border border-white/10 flex items-center justify-center gap-2 min-h-14 flex-grow sm:flex-grow-0"
              >
                <Sparkles className="w-5 h-5 text-blue-400" />
                Demonstração Completa
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs sm:text-sm">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 border-2 border-[#0f172a] flex items-center justify-center text-[9px] sm:text-[10px]">DR</div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 border-2 border-[#0f172a] flex items-center justify-center text-[9px] sm:text-[10px]">AP</div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 border-2 border-[#0f172a] flex items-center justify-center text-[9px] sm:text-[10px]">+</div>
              </div>
              <span className="text-slate-400">+200 profissionais</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full"></div>
            <div className="relative glass-card p-8 rounded-[2.5rem] border-white/10 overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Escolha seu Nicho</h3>
                  <p className="text-slate-400 text-sm">Teste nossa IA agora mesmo</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {nichos.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setChatNicho(n.slug);
                      setIsChatOpen(true);
                    }}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">{n.nome_nicho}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-emerald-400 font-medium">Selecione um nicho para iniciar a demonstração</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Pain Points Section */}
        <section className="bg-slate-900/50 py-10 sm:py-14 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10">Quanto custa cada minuto de demora?</h2>
            <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
              {[
                { icon: Clock, title: 'Leads Frios', text: '78% dos clientes compram da empresa que responde primeiro. Se você demora 5 minutos, a chance de conversão cai 10x.', color: 'text-red-500' },
                { icon: UserX, title: 'No-show Elevado', text: 'Sem lembretes automáticos e eficientes, sua agenda fica cheia de buracos e seu faturamento despenca.', color: 'text-red-500' },
                { icon: Smartphone, title: 'Escravo do Celular', text: 'Você interrompe seus atendimentos para responder dúvidas básicas que uma IA resolveria em segundos.', color: 'text-red-500' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 sm:p-8 rounded-3xl text-left space-y-4"
                >
                  <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="space-y-8 sm:space-y-12">
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Uma experiência de atendimento <span className="text-blue-500">insuperável.</span>
              </h2>
              <div className="space-y-6 sm:space-y-8">
                {[
                  { title: 'Resposta Instantânea 24/7', text: 'Seu cliente é atendido no sábado à noite ou feriado, sem que você precise tocar no celular.' },
                  { title: 'Qualificação Inteligente', text: 'A IA faz as perguntas certas e só passa para o agendamento os pacientes que realmente têm o perfil desejado.' },
                  { title: 'Agendamento Direto', text: 'Integração total com Google Calendar ou sua plataforma favorita. A IA marca o horário sozinha.' }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1 text-sm sm:text-base">{benefit.title}</h4>
                      <p className="text-slate-400 text-xs sm:text-sm">{benefit.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6 sm:p-8 flex items-center justify-center"
            >
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="text-5xl sm:text-6xl font-bold text-blue-500">+45%</div>
                <p className="text-lg sm:text-xl font-medium">Aumento médio em agendamentos no primeiro mês.</p>
                <p className="text-slate-400 text-xs sm:text-sm">Baseado em dados reais de nossos clientes ativos.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-10 sm:py-14 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-blue-400 text-xs sm:text-sm font-medium mb-2 uppercase tracking-widest">Processo Simples</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Como Funciona</h2>
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
                Comece em 4 passos simples
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { step: '1', title: 'Contratação', text: 'Escolha seu plano e contrate. Leva menos de 5 minutos.', icon: ClipboardCheck, color: 'text-blue-500' },
                { step: '2', title: 'Onboarding', text: 'Nossa equipe configura seu agente com dados da sua empresa.', icon: Settings, color: 'text-emerald-500' },
                { step: '3', title: 'Ativação', text: 'Seu agente vai ao ar e começa a receber mensagens.', icon: Rocket, color: 'text-blue-500' },
                { step: '4', title: 'Crescimento', text: 'Monitore resultados e veja seus agendamentos crescer.', icon: TrendingUp, color: 'text-emerald-500' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="glass-card p-8 rounded-3xl h-full flex flex-col items-start space-y-6 hover:border-white/20 transition-all">
                    <div className="flex justify-between items-start w-full">
                      <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="text-4xl font-black text-white/10 group-hover:text-white/20 transition-colors">
                        {item.step}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-0">
                      <ArrowRight className="w-6 h-6 text-white/5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Features Section */}
        <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-blue-400 text-xs sm:text-sm font-medium mb-2 uppercase tracking-widest">Recursos Avançados</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Tudo que você precisa, integrado</h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Tecnologia de ponta para escalar seu atendimento sem perder a essência humana.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { title: 'Conversas Naturais', text: 'IA treinada para conversar como um atendente humano, com empatia e naturalidade.', icon: MessageCircle, color: 'text-blue-500' },
              { title: 'Integração de Calendário', text: 'Conecta com Google Calendar e outros. Agendamento automático em tempo real.', icon: Calendar, color: 'text-emerald-500' },
              { title: 'CRM Integrado', text: 'Histórico completo de cada cliente. Nada se perde, tudo fica organizado.', icon: LayoutDashboard, color: 'text-blue-500' },
              { title: 'Relatórios em Tempo Real', text: 'Acompanhe métricas: taxa de conversão, tempo de resposta, leads qualificados.', icon: BarChart3, color: 'text-emerald-500' },
              { title: 'Lembretes Automáticos', text: 'IA envia lembretes de consultas e reduz no-show em até 80%.', icon: Bell, color: 'text-blue-500' },
              { title: 'Segurança Garantida', text: 'Criptografia de ponta a ponta. Dados do cliente sempre protegidos.', icon: ShieldCheck, color: 'text-emerald-500' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 hover:bg-white/10 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Atendimento Manual vs. IA Agent</h2>
            <p className="text-slate-400 text-base sm:text-lg">Veja a diferença na prática</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Manual Support Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl border-red-500/20 bg-red-500/5"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <X className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Atendimento Manual</h3>
              </div>
              
              <ul className="space-y-4">
                {[
                  "Seu Telefone Nonstop",
                  "Você interrompe seus atendimentos",
                  "Demora 5+ minutos para responder",
                  "Lead perde o interesse e vai embora",
                  "Agendar é caótico, sem padrão",
                  "Alto índice de no-show",
                  "Faturamento irregular"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-400">
                    <X className="w-5 h-5 text-red-500/50 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* AI Agent Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Recomendado</div>
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Com AI Agent</h3>
              </div>
              
              <ul className="space-y-4">
                {[
                  "Resposta em 3 segundos, 24/7",
                  "Nenhuma mensagem fica sem resposta",
                  "Lead qualificado chega até você",
                  "Agendamento 100% automático",
                  "Redução de até 80% no no-show",
                  "Faturamento previsível e crescente"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-200">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-white">Planos de Manutenção e Infraestrutura (Mensal)</h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Garantimos seu agente rodando 24h por dia, com acesso ao nosso CRM exclusivo.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <PricingCard 
              title="Plano Start"
              price="Sob Consulta"
              priceSuffix=""
              icon={Users}
              buttonText="Falar com Consultor"
              features={[
                '1 Agente de IA Personalizado',
                'Número de WhatsApp incluso',
                'Acesso ao CRM Essencial',
                'Atendimento Padrão (FAQ e Qualificação)',
                'Suporte via Ticket (48h)'
              ]}
            />
            <PricingCard 
              title="Plano Business"
              price="Sob Consulta"
              priceSuffix=""
              icon={Zap}
              popular={true}
              buttonText="Falar com Consultor"
              features={[
                'Tudo do plano Start',
                'Integração com Google Calendar e Sheets',
                'Acesso ao CRM Completo (Múltiplos Usuários)',
                '1 Revisão/Ajuste mensal no fluxo da IA',
                'Suporte Prioritário via WhatsApp'
              ]}
            />
            <PricingCard 
              title="Plano Enterprise"
              price="Sob Consulta"
              priceSuffix=""
              icon={Crown}
              buttonText="Falar com Consultor"
              features={[
                'Ecossistema Completo de Vendas',
                'Busca ativa em banco de dados (Ex: E-commerce/Imóveis)',
                'Módulo de Campanhas e Relatórios Avançados',
                'Ajustes e otimizações contínuas',
                'Grupo VIP de Suporte e Assessoria'
              ]}
            />
          </div>
        </section>

        {/* Onboarding Section */}
        <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Taxa de Implantação (Setup Único)</h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Projeto de criação, integração e 15 dias de acompanhamento intensivo (Hypercare).
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <SetupCard 
              title="Setup Essencial"
              price="Orçamento Personalizado"
              focus="Instalação do Fluxo Padrão de Atendimento."
              includes="Configuração da IA, Conexão com o CRM, 2 Reuniões de Alinhamento, 15 dias de Hypercare. Sem integrações externas."
              icon={Settings}
            />
            <SetupCard 
              title="Setup Intermediário"
              price="Orçamento Personalizado"
              focus="Fluxo Padrão + Automações de Agenda/Planilha."
              includes="Tudo do Essencial + Integração com Google Calendar ou Sheets, 4 Reuniões de Alinhamento."
              icon={Zap}
              popular={true}
            />
            <SetupCard 
              title="Setup Avançado"
              price="Orçamento Personalizado"
              focus="Mapeamento e Criação de Fluxo 100% Sob Medida."
              includes="Integrações complexas (Sites Imobiliários, E-commerce, Bancos de Dados), Engenharia de Prompt Avançada, 6 Reuniões de Alinhamento."
              icon={Rocket}
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-10 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-blue-400 text-xs sm:text-sm font-medium mb-2">Dúvidas Comuns</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Perguntas Frequentes</h2>
            <p className="text-slate-400 text-base sm:text-lg">Encontre respostas para as principais dúvidas sobre nossos serviços.</p>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <FAQItem question="Posso trocar de plano depois?" answer="Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor no próximo ciclo de faturamento." />
            <FAQItem question="Existe período de fidelidade?" answer="Todos os planos tem contrato mínimo de 3 meses. Após esse período, você pode cancelar a qualquer momento sem multas. Mas como sempre gostamos de dizer: Consistência é fundamental." />
            <FAQItem question="Como funciona o suporte?" answer="Oferecemos suporte via chat de segunda a sexta, das 8h às 18h. Clientes dos planos pagos têm prioridade no atendimento." />
            <FAQItem question="Preciso de conhecimento técnico?" answer="Não! Nossa plataforma foi desenvolvida para ser intuitiva. Além disso, oferecemos onboarding e materiais de apoio para você começar rapidamente." />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-10 sm:py-14 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Quem já utiliza e recomenda</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {[
                { name: 'Dr. Leandro M.', role: 'Dentista', text: '"Antes eu perdia metade do meu dia respondendo preços e horários. Agora a IA resolve tudo e eu só recebo a notificação da consulta marcada."' },
                { name: 'Mariana Costa', role: 'Psicóloga', text: '"Meus pacientes adoraram! Dizem que o atendimento é rápido e muito educado. Não troco por nada."' },
                { name: 'Felipe S.', role: 'Nutricionista', text: '"O melhor investimento do ano. Reduzi meu no-show em 30% só com os lembretes automáticos da IA."' }
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 sm:space-y-6"
                >
                  <div className="flex text-yellow-500 gap-1">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-slate-300 italic text-xs sm:text-sm leading-relaxed">{t.text}</p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0"></div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Form Section */}
        <section id="leads" className="py-10 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6 w-full">
          <div className="bg-blue-600 rounded-[3rem] p-6 sm:p-10 md:p-16 text-center space-y-6 sm:space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            {formStatus === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 sm:p-6 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl relative z-10"
              >
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-white">Solicitação Enviada!</h3>
                <p className="text-emerald-100 text-xs sm:text-sm">Nossa equipe entrará em contato em breve.</p>
                <button 
                  onClick={() => setFormStatus('idle')}
                  className="mt-6 text-white/60 hover:text-white text-sm underline"
                >
                  Enviar outra solicitação
                </button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold relative z-10 text-white">
                  Pronto para automatizar sua agenda?
                </h2>
                <p className="text-blue-100 text-sm sm:text-base md:text-lg relative z-10">
                  Preencha os dados abaixo e entraremos em contato para configurar seu agente de IA personalizado.
                </p>
                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3 sm:space-y-4 relative z-10 text-left">
                  <div>
                    <label htmlFor="nome" className="block text-xs sm:text-sm font-medium mb-1 text-blue-50">Nome Completo</label>
                    <input 
                      type="text" 
                      id="nome" 
                      name="nome"
                      required 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-blue-200 text-sm text-white" 
                      placeholder="Seu nome" 
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1 text-blue-50">E-mail</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        required 
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-blue-200 text-sm text-white" 
                        placeholder="seu@email.com" 
                      />
                    </div>
                    <div>
                      <label htmlFor="whatsapp" className="block text-xs sm:text-sm font-medium mb-1 text-blue-50">WhatsApp</label>
                      <input 
                        type="tel" 
                        id="whatsapp" 
                        name="whatsapp"
                        required 
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-blue-200 text-sm text-white" 
                        placeholder="(00) 00000-0000" 
                      />
                    </div>
                  </div>
                  {formStatus === 'error' && (
                    <p className="text-red-300 text-xs text-center">Erro ao enviar. Tente novamente.</p>
                  )}
                  <button 
                    type="submit" 
                    disabled={formStatus === 'loading'}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2 min-h-12 sm:min-h-14 disabled:opacity-50"
                  >
                    {formStatus === 'loading' ? (
                      <span className="animate-spin">◌</span>
                    ) : (
                      <>
                        <span>Solicitar Demonstração</span>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      <ChatDemo 
        nichos={nichos} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        initialNicho={chatNicho}
      />

      <footer className="py-8 sm:py-12 text-center border-t border-white/5 text-slate-500 text-xs sm:text-sm">
        <p>© 2026 AI Agent Service. Todos os direitos reservados.</p>
        
        <div className="mt-6 flex flex-col items-center gap-3">
          {user ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400">{user.email}</span>
              <div className="flex gap-3">
                {isAdmin && (
                  <button 
                    onClick={handleAdminToggle}
                    className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20 transition-all font-bold"
                  >
                    Gerenciar Nichos
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all"
                >
                  Sair
                </button>
              </div>
              {isAdmin && (
                <button 
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10 transition-colors"
                >
                  {isSeeding ? 'Seeding...' : 'Seed Database (Nichos)'}
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all"
            >
              Admin Login
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
