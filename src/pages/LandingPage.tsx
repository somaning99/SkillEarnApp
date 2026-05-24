import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Users, Zap, Search, Globe, Shield, 
  ChevronDown, Check, Star, Play, Settings, 
  LayoutDashboard, BarChart2, MessageCircle, Mail, ArrowRight,
  TrendingUp, Award, AwardIcon
} from 'lucide-react';
import UniqueSection from '../components/UniqueSection';
import { useAuth } from '../hooks/useAuth';
import DarkModeToggle from '../components/DarkModeToggle';
import Hero3D from '../components/Hero3D';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [latestProjects, setLatestProjects] = useState<any[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeDashboardTab, setActiveDashboardTab] = useState('Overview');

  const goToDashboard = () => {
    if (user?.role === 'student') navigate('/student-dashboard');
    else if (user?.role === 'client') navigate('/client-dashboard');
  };

  useEffect(() => {
    const fetchLatestProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setLatestProjects(data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Error fetching latest projects:', err);
      }
    };
    fetchLatestProjects();
  }, []);

  const features = [
    { 
      icon: <Zap className="w-6 h-6 text-purple-400" />, 
      title: 'AI Matchmaking', 
      desc: 'Automate project matching based on your student profile and skills.',
      badge: 'Smart'
    },
    { 
      icon: <BarChart2 className="w-6 h-6 text-cyan-400" />, 
      title: 'Smart Analytics', 
      desc: 'Track your growth, earnings, and skill advancement in real-time.',
      badge: 'Insights'
    },
    { 
      icon: <Users className="w-6 h-6 text-blue-400" />, 
      title: 'Team Collaboration', 
      desc: 'Co-work with fellow students on large enterprise contracts.',
      badge: 'Teams'
    },
    { 
      icon: <Shield className="w-6 h-6 text-indigo-400" />, 
      title: 'Secure Payouts', 
      desc: 'Escrow-backed secure payment system with direct milestone releases.',
      badge: 'Protected'
    },
  ];

  const partners = [
    { name: 'Acme Inc.', logo: '⚡' },
    { name: 'Echo', logo: '🌐' },
    { name: 'Cloudix', logo: '☁️' },
    { name: 'Vertica', logo: '📐' },
    { name: 'Pulse', logo: '❤️' },
    { name: 'Matter', logo: '⚛️' }
  ];

  const testimonials = [
    {
      quote: "SkillEarn has transformed how we hire student developers. The AI matching saves us hours every single week.",
      name: "Sarah Johnson",
      role: "CTO, Acme Inc.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      quote: "The team option is fantastic. We built a complete SaaS application with three brilliant computer science majors.",
      name: "Michael Chen",
      role: "Product Manager, Cloudix",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      quote: "Highly recommended! Secured a paid front-end internship and built a verified work history before graduating.",
      name: "Emily Davis",
      role: "MIT Student Developer",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      monthlyPrice: 19,
      yearlyPrice: 15,
      desc: "Perfect for students starting their freelance journey.",
      features: [
        "Up to 5 active proposals",
        "Standard AI matching score",
        "Basic earnings analytics",
        "Standard payout clearance",
        "Community support"
      ]
    },
    {
      name: "Pro",
      monthlyPrice: 49,
      yearlyPrice: 39,
      desc: "Best for growing freelancers & premium client teams.",
      features: [
        "Unlimited active proposals",
        "Priority AI matching boost",
        "Advanced profile verified badge",
        "Accelerated 24h milestone clearance",
        "Dedicated discord channel access",
        "Group project hosting"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: 99,
      yearlyPrice: 79,
      desc: "For institutions, universities, and large organizations.",
      features: [
        "All features of Pro plan",
        "Custom billing & invoicing options",
        "Advanced analytics exports",
        "Dedicated account manager",
        "Vetted student developer vetting API",
        "Priority live moderation support"
      ]
    }
  ];

  const faqs = [
    {
      q: "What is SkillEarn?",
      a: "SkillEarn is a premium, next-generation freelance platform that bridges the gap between top-tier student talent and active businesses. We automate matching, secure escrow, and help teams build complex projects."
    },
    {
      q: "How does the AI matching work?",
      a: "Our AI model matches student developer skills, course histories, and verified credentials against active client requirements to generate an absolute fit score, ensuring high project success rates."
    },
    {
      q: "Can students team up for large contracts?",
      a: "Yes! Students can form virtual co-ops and joint groups to apply for complex client projects that normally require multiple engineers, simulating a real software agency setup."
    },
    {
      q: "Is there support for secure payments?",
      a: "Absolutely. All milestone funds are held in secure project escrows and released instantly upon review, protecting both student labor and client capital."
    }
  ];

  return (
    <div className="min-h-screen bg-[#03001e] text-slate-100 selection:bg-purple-600/30 selection:text-purple-300 font-sans overflow-x-hidden relative">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px] -translate-y-1/2 pointer-events-none z-0" />
      <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[10%] w-[700px] h-[700px] rounded-full bg-indigo-950/10 blur-[200px] pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#03001e]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
              <Zap size={18} />
            </div>
            <span className="text-xl font-extrabold tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">SkillEarn</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-purple-400 transition-colors">How it works</a>
            <button onClick={() => navigate('/marketplace')} className="hover:text-purple-400 transition-colors text-slate-400">Marketplace</button>
            <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-sm font-bold text-white transition-all shadow-md shadow-purple-500/15 flex items-center gap-1.5"
            >
              Get Started
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-950/40 border border-purple-500/20 rounded-full text-xs font-bold text-purple-300 w-fit cursor-pointer hover:bg-purple-950/60 transition-colors"
                onClick={() => navigate('/marketplace')}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                New: Version 2.0 is now live
                <span className="text-purple-400 ml-1">→</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
                  The Future of <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                    Student Freelancing
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
                  SkillEarn helps students build enterprise-ready portfolios, automate client matchmaking, and accelerate engineering careers with secure collaborative tools.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap gap-4"
              >
                <button 
                  onClick={() => navigate('/register')} 
                  className="px-7 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all flex items-center gap-2 group"
                >
                  Get Started
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/marketplace')} 
                  className="px-7 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2"
                >
                  <Play size={16} fill="white" />
                  Explore Marketplace
                </button>
              </motion.div>

              {/* Mini trust features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="pt-6 grid grid-cols-3 gap-6 border-t border-white/5 max-w-md text-slate-500"
              >
                <div>
                  <div className="text-2xl font-extrabold text-white">10K+</div>
                  <div className="text-xs">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">98.5%</div>
                  <div className="text-xs">Satisfaction</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">24/7</div>
                  <div className="text-xs">Support</div>
                </div>
              </motion.div>
            </div>

            {/* Right Column 3D Visualizer */}
            <div className="lg:col-span-5 relative flex justify-center items-center h-[400px] sm:h-[500px] w-full">
              {/* R3F Canvas */}
              <div className="absolute inset-0">
                <Hero3D />
              </div>
              
              {/* Floating badges surrounding the cube */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-0 glass-panel p-3.5 rounded-2xl flex items-center gap-3 border border-white/10 shadow-glass"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">⚡</div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Top Skills</div>
                  <div className="text-xs font-bold text-white">React & Next.js</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 right-0 glass-panel p-3.5 rounded-2xl flex items-center gap-3 border border-white/10 shadow-glass"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">&lt;/&gt;</div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Match Rate</div>
                  <div className="text-xs font-bold text-white">98% Accuracy</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners / Brands Section */}
      <section className="py-12 border-y border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-slate-600 uppercase tracking-widest mb-8">Trusted by teams from innovative companies</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center opacity-40 hover:opacity-60 transition-opacity">
            {partners.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-400 font-extrabold text-lg select-none">
                <span className="text-xl">{p.logo}</span>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid & Interactive Dashboard Mockup */}
      <section id="features" className="py-24 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Features Info column */}
            <div className="lg:col-span-5 text-left space-y-10">
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest px-3 py-1 bg-purple-950/40 border border-purple-500/20 rounded-full">
                  FEATURES
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  Everything you need to <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                    build the future
                  </span>
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Consolidate your client interactions, monitor ongoing milestones, and coordinate teams with ease.
                </p>
              </div>

              {/* Grid cards */}
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((f, i) => (
                  <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 glass-panel-hover text-left">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shadow-inner">
                      {f.icon}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm">{f.title}</h4>
                        <span className="text-[9px] font-bold text-purple-400 px-1.5 py-0.5 rounded bg-purple-950/30 border border-purple-500/10 uppercase tracking-wider">{f.badge}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mt-2">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Dashboard column */}
            <div className="lg:col-span-7">
              <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-glass overflow-hidden relative group">
                {/* Dashboard mock header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="text-xs font-semibold text-slate-500 ml-2">App / Workspace / Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-white/10"><Search size={12} /></div>
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-white/10"><Settings size={12} /></div>
                  </div>
                </div>

                {/* Dashboard layout */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Left Sidebar Mockup */}
                  <div className="col-span-3 space-y-2 border-r border-white/5 pr-4 hidden sm:block">
                    {['Overview', 'Projects', 'Analytics', 'Team', 'Settings'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setActiveDashboardTab(item)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                          activeDashboardTab === item 
                            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/10' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item}
                      </button>
                    ))}
                  </div>

                  {/* Dashboard body */}
                  <div className="col-span-12 sm:col-span-9 space-y-6 text-left">
                    <div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Earnings</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-white">$24,580</span>
                        <span className="text-xs font-semibold text-green-400 flex items-center gap-0.5"><TrendingUp size={12} />+12.5%</span>
                      </div>
                    </div>

                    {/* Chart panel */}
                    <div className="h-36 relative flex items-end">
                      {/* Interactive glowing chart */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path 
                          d="M0,80 Q30,50 60,65 T120,40 T180,50 T240,20 T300,30 L300,100 L0,100 Z" 
                          fill="url(#chart-glow)" 
                        />
                        {/* Line */}
                        <path 
                          d="M0,80 Q30,50 60,65 T120,40 T180,50 T240,20 T300,30" 
                          fill="none" 
                          stroke="#7c3aed" 
                          strokeWidth="3"
                          className="drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                        />
                        {/* Dots */}
                        <circle cx="240" cy="20" r="4" fill="#a78bfa" className="animate-pulse" />
                      </svg>

                      {/* Tooltip mockup */}
                      <div className="absolute top-4 right-[20%] p-2 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-bold shadow-lg">
                        <span className="text-slate-400">Peak:</span> <span className="text-purple-400">$8,450</span>
                      </div>
                    </div>

                    {/* Metrics Footer */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">AI Insights</div>
                        <div className="text-lg font-black text-white mt-0.5">78%</div>
                        <p className="text-[9px] text-slate-500">Milestones automated</p>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Active Developers</div>
                        <div className="text-lg font-black text-white mt-0.5">1,642</div>
                        {/* User avatars list */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex -space-x-2">
                            <div className="w-4.5 h-4.5 rounded-full bg-purple-500 border border-slate-950 flex items-center justify-center text-[7px] font-black text-white">S</div>
                            <div className="w-4.5 h-4.5 rounded-full bg-blue-500 border border-slate-950 flex items-center justify-center text-[7px] font-black text-white">M</div>
                            <div className="w-4.5 h-4.5 rounded-full bg-cyan-500 border border-slate-950 flex items-center justify-center text-[7px] font-black text-white">E</div>
                          </div>
                          <span className="text-[8px] text-green-400 font-bold">+24 online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mesmerizing particle canvas divider */}
      <UniqueSection />

      {/* Testimonials */}
      <section className="py-24 bg-slate-950/20 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-cyan-950/40 border border-cyan-500/20 rounded-full">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Loved by teams <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                around the world
              </span>
            </h2>
            <p className="text-slate-400">
              Hear directly from top enterprise builders and verified students collaborating on SkillEarn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-panel p-8 rounded-3xl border border-white/5 glass-panel-hover flex flex-col justify-between text-left space-y-6">
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border border-purple-500/30" />
                  <div>
                    <h5 className="font-extrabold text-white text-sm">{t.name}</h5>
                    <p className="text-xs text-slate-500">{t.role}</p>
                    <div className="flex gap-0.5 mt-1.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={11} fill="#eab308" className="text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest px-3 py-1 bg-purple-950/40 border border-purple-500/20 rounded-full">
              PRICING
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Simple, transparent <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                pricing plans
              </span>
            </h2>
            <p className="text-slate-400">
              Choose the tier that matches your frequency of operations and team requirements.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-xs font-bold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="w-12 h-6.5 rounded-full bg-slate-900 border border-white/10 p-0.5 flex items-center transition-colors relative"
              >
                <div className={`w-5.5 h-5.5 rounded-full bg-purple-600 shadow-md transition-all ${isYearly ? 'translate-x-5.5' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold transition-colors ${isYearly ? 'text-purple-400' : 'text-slate-500'}`}>Yearly</span>
                <span className="text-[9px] font-black text-purple-400 px-1.5 py-0.5 rounded-full bg-purple-950/40 border border-purple-500/20 uppercase tracking-wider">Save 20%</span>
              </div>
            </div>
          </div>

          {/* Cards container */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {pricingPlans.map((plan, i) => (
              <div 
                key={i} 
                className={`rounded-3xl p-8 border flex flex-col justify-between text-left transition-all ${
                  plan.popular 
                    ? 'pricing-glow-border border-purple-500/40 shadow-[0_0_40px_rgba(124,58,237,0.15)] relative scale-100 md:scale-105 z-10' 
                    : 'glass-panel border-white/5 hover:border-white/15'
                }`}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                    </div>
                    {plan.popular && (
                      <span className="text-[9px] font-black text-white px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border border-purple-400/20 uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>

                  <ul className="space-y-3.5 pt-6 border-t border-white/5">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-400">
                        <Check size={14} className="text-purple-400 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => navigate('/register')} 
                  className={`w-full py-3.5 mt-8 rounded-xl text-xs font-bold transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 shadow-md shadow-purple-500/20' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion & Chat Bubbles Graphics */}
      <section className="py-24 bg-slate-950/20 border-t border-white/5 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Left FAQ content */}
            <div className="lg:col-span-7 text-left space-y-12">
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-950/40 border border-indigo-500/20 rounded-full">
                  FAQ
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  Frequently asked <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    questions
                  </span>
                </h2>
                <p className="text-slate-400">
                  Can't find the answer you're looking for? Reach out directly to our global helpdesk or support mail.
                </p>
              </div>

              {/* Accordions */}
              <div className="space-y-4 max-w-2xl">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-5 text-left flex justify-between items-center font-bold text-white text-sm hover:bg-white/5 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown 
                        size={16} 
                        className={`text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {openFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-white/5 text-xs text-slate-500 leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Graphics columns (floating glass bubbles) */}
            <div className="lg:col-span-5 relative flex justify-center items-center h-[350px]">
              <div className="absolute w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
              
              {/* Glass bubble 1 */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-10 p-5 rounded-3xl glass-panel border border-white/10 shadow-glass w-64 text-left space-y-3"
              >
                <div className="flex items-center gap-2 text-purple-400 font-bold text-[10px] uppercase">
                  <MessageCircle size={12} />
                  <span>Matching Support</span>
                </div>
                <p className="text-xs text-white leading-relaxed">
                  How long does matching usually take?
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed border-t border-white/5 pt-2">
                  Matching is instant! Typically completed within 3 seconds using verified credentials.
                </p>
              </motion.div>

              {/* Glass bubble 2 */}
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 right-10 p-5 rounded-3xl glass-panel border border-white/10 shadow-glass w-60 text-left space-y-2.5"
              >
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-[10px] uppercase">
                  <Zap size={12} />
                  <span>Trust Score</span>
                </div>
                <p className="text-xs text-white">
                  Is the trust score rating verified?
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed border-t border-white/5 pt-2">
                  Yes, backed by verified project feedback and completed code submissions.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Sign up banner */}
      <section className="py-24 relative overflow-hidden z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-purple-950/40 via-indigo-950/40 to-slate-900/40 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden border border-white/5 shadow-glass">
            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />
            
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              Ready to accelerate <br />
              your engineering career?
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of vetted student developers and clients who are deploying production code together today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/register')} 
                className="px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold transition-all shadow-lg flex items-center gap-2"
              >
                Get Started Now
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => navigate('/marketplace')} 
                className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/15"
              >
                Browse Projects
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-950/40 text-slate-500 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-12 border-b border-white/5">
          {/* Logo & Bio Column */}
          <div className="md:col-span-5 text-left space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white">
                <Zap size={15} />
              </div>
              <span className="text-lg font-black tracking-tight text-white uppercase">SkillEarn</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs text-slate-500">
              SkillEarn is the ultimate web engineering pipeline matching vetted university builders with modern remote enterprises.
            </p>
            {/* Social icons */}
            <div className="flex gap-4">
              {['twitter', 'linkedin', 'github', 'discord'].map((social) => (
                <a key={social} href="#" className="w-7.5 h-7.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <span className="capitalize text-[10px] font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Product</h5>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate('/marketplace')} className="hover:text-slate-300">Marketplace</button></li>
                <li><a href="#features" className="hover:text-slate-300">Features</a></li>
                <li><a href="#pricing" className="hover:text-slate-300">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-300">Leaderboard</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Company</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-slate-300">About Us</a></li>
                <li><a href="#" className="hover:text-slate-300">Careers</a></li>
                <li><a href="#" className="hover:text-slate-300">Privacy Policy</a></li>
                <li><a href="mailto:somubelagaonkar@gmail.com" className="hover:text-slate-300">Support Mail</a></li>
              </ul>
            </div>
          </div>

          {/* Stay updated / newsletter */}
          <div className="md:col-span-3 text-left space-y-4">
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Stay Updated</h5>
            <p className="text-xs text-slate-500">Subscribe to receive tech trends & direct project listings.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="you@email.com" 
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-white" 
              />
              <button className="px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Mail size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Copyright strip */}
        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-semibold uppercase tracking-wider">
          <span>&copy; {new Date().getFullYear()} SkillEarn. All rights reserved.</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

