'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldAlert, Sparkles, FileText, Zap, 
  CheckCircle2, Play, Users, BarChart3, Scale, Clock, 
  ChevronRight, BrainCircuit
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  
  const [activeAgent, setActiveAgent] = useState(0);

  // Enforce dark mode on landing page for premium aesthetic
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      {/* Dynamic Aurora Background (Optimized for Performance) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0A0A0B]" />
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(79,70,229,0.15)_0%,transparent_60%)] animate-blob will-change-transform" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] bg-[radial-gradient(circle,rgba(147,51,234,0.15)_0%,transparent_60%)] animate-blob animation-delay-2000 will-change-transform" />
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[50%] bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,transparent_60%)] animate-blob animation-delay-4000 will-change-transform" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Scale size={18} className="text-white" />
            </div>
            PDF<span className="text-indigo-400">OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#agents" className="hover:text-white transition-colors">AI Agents</a>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 transition-transform active:scale-95"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8"
          >
            <Sparkles size={16} className="text-indigo-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Introducing PDF OS 2.0
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Your AI Contract <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
              Copilot.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Upload any contract. Identify hidden risks instantly. <br className="hidden md:block" />
            Understand legal jargon in plain English. Negotiate smarter before you sign.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => router.push('/dashboard')}
              className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg flex items-center gap-2 hover:scale-105 transition-all active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">Get Started</span>
              <ArrowRight size={20} className="relative group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold text-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
              <Play size={20} />
              Watch Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-14 flex flex-col items-center justify-center gap-4 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm shadow-xl">
              <span className="text-gray-400 font-medium">Engineered from scratch by</span>
              <span className="font-bold text-white tracking-wide">Sayak Mondal</span>
            </div>
            
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2 mb-1">
              In Collaboration With
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest mt-1">
              <span className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-md text-purple-300/80">
                <Sparkles size={14} className="text-purple-400" />
                AI / ML
              </span>
              <span className="flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 px-3 py-1.5 rounded-md text-pink-300/80">
                <Zap size={14} className="text-pink-400" />
                Featherless
              </span>
              <span className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-md text-blue-300/80">
                <Users size={14} className="text-blue-400" />
                Band AI
              </span>
            </div>
          </motion.div>
        </section>

        {/* About This App Section */}
        <section className="max-w-4xl mx-auto px-6 mb-32 text-center" id="about">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold uppercase tracking-widest text-indigo-400">
              <FileText size={14} /> About This Platform
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Understand, Edit, and Share Documents <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Smarter</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl">
              From AI-powered contract analysis and risk detection to professional PDF editing and dynamic QR code generation, our platform transforms complex documents into actionable insights. Review faster, negotiate confidently, edit seamlessly, and share securely—all in a single intelligent workspace.
            </p>
          </motion.div>
        </section>

        {/* Live Animated AI Demo Section */}
        <section className="max-w-6xl mx-auto px-6 mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="relative rounded-2xl border border-white/10 bg-[#0F1117] shadow-2xl overflow-hidden"
          >
            {/* Browser Header */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-[#1A1D24]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto w-1/3 h-6 bg-white/5 rounded-md flex items-center justify-center text-xs text-gray-500">
                <ShieldAlert size={12} className="mr-2" /> secure.pdfos.ai
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="flex h-[500px]">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/10 p-4 bg-[#0A0A0B]">
                <div className="h-8 w-3/4 bg-white/5 rounded mb-8" />
                <div className="space-y-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-sm bg-white/10" />
                      <div className="h-4 flex-1 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Main Content (Animated) */}
              <div className="flex-1 p-8 relative overflow-hidden">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-8 w-1/3 bg-white/10 rounded" />
                    <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Sparkles size={12} /> AI Analysis Complete
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Animated Scanning Effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan" />

                    {/* Clauses */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-red-400 text-sm">Critical Risk Detected</div>
                        <div className="text-xs text-gray-500">Auto-Renewal Clause</div>
                      </div>
                      <div className="text-sm text-gray-300 mb-3">
                        "The agreement shall automatically renew for successive terms of three (3) years unless terminated with 90 days written notice."
                      </div>
                      <div className="p-3 bg-[#0A0A0B] rounded-lg border border-white/5 text-sm">
                        <div className="text-indigo-400 font-semibold mb-1 flex items-center gap-2">
                          <Sparkles size={14} /> AI Recommendation
                        </div>
                        <span className="text-gray-400">Suggest capping renewal at 1 year and reducing notice period to 30 days.</span>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-yellow-400 text-sm">Moderate Risk</div>
                        <div className="text-xs text-gray-500">Liability Cap</div>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded mt-2" />
                      <div className="h-2 w-3/4 bg-white/5 rounded mt-2" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glow below mockup */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-indigo-500/30 blur-[100px] pointer-events-none" />
          </motion.div>
        </section>

        {/* Social Proof Metrics */}
        <section className="max-w-7xl mx-auto px-6 mb-40 border-y border-white/5 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-2">10M+</div>
              <div className="text-sm text-gray-400 font-medium tracking-wide uppercase">Contracts Analyzed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-2">99.8%</div>
              <div className="text-sm text-gray-400 font-medium tracking-wide uppercase">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-2">2.5s</div>
              <div className="text-sm text-gray-400 font-medium tracking-wide uppercase">Avg Analysis Time</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-2">$50B+</div>
              <div className="text-sm text-gray-400 font-medium tracking-wide uppercase">Risk Prevented</div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 mb-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Contract review, reimagined.</h2>
            <p className="text-gray-400 text-lg">From upload to executive summary in under 5 seconds.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: FileText, title: 'Upload Contract', desc: 'Securely upload PDF or Word documents instantly.' },
              { icon: BrainCircuit, title: 'AI Analysis', desc: 'Our LLMs extract clauses and context automatically.' },
              { icon: ShieldAlert, title: 'Risk Detection', desc: 'Hidden pitfalls are flagged and scored by severity.' },
              { icon: CheckCircle2, title: 'Summary Generated', desc: 'Get an executive brief ready for stakeholders.' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                  <step.icon size={24} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
                
                {/* Connector Line (hidden on mobile) */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-indigo-500/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Agents Section */}
        <section id="agents" className="max-w-7xl mx-auto px-6 mb-40">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">A full legal team <br /> in your browser.</h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Our autonomous AI agents work together to process your documents. 
                They extract data, identify risks, and draft summaries perfectly in sync.
              </p>
              
              <div className="space-y-4">
                {[
                  { name: 'Extractor Agent', desc: 'Reads and understands contract structures.' },
                  { name: 'Risk Agent', desc: 'Detects legal and business liabilities.' },
                  { name: 'Negotiation Agent', desc: 'Suggests safer clause alternatives.' },
                  { name: 'Summary Agent', desc: 'Creates executive-level briefs.' },
                ].map((agent, i) => (
                  <div 
                    key={i}
                    onClick={() => setActiveAgent(i)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      activeAgent === i 
                      ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${activeAgent === i ? 'text-indigo-400' : 'text-white'}`}>{agent.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{agent.desc}</p>
                      </div>
                      <ChevronRight size={20} className={activeAgent === i ? 'text-indigo-400' : 'text-gray-600'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-[#12141D] to-[#0A0A0B] border border-white/10 flex items-center justify-center p-8 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAgent}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 w-full max-w-sm will-change-transform"
                >
                  <div className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
                    <div className="bg-[#1A1D24] rounded-xl p-6 border border-white/5 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                          <Zap size={20} className="text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Processing Status</div>
                          <div className="font-semibold text-green-400">Agent Active</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="h-2 w-full bg-white/5 rounded overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-0 left-0 h-full bg-indigo-500" 
                          />
                        </div>
                        <div className="h-2 w-3/4 bg-white/5 rounded" />
                        <div className="h-2 w-5/6 bg-white/5 rounded" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Backdrop Glow Optimized */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(99,102,241,0.2)_0%,transparent_60%)] -z-10 pointer-events-none" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6 mb-32">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 opacity-50" />
            <div className="absolute top-0 right-0 w-[150%] h-[150%] -translate-y-1/2 translate-x-1/4 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_50%)] pointer-events-none" />
            
            <div className="relative z-10 p-12 md:p-20 text-center border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Stop signing blindly.</h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of professionals saving hours of manual review and protecting themselves from hidden liabilities.
              </p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
              >
                Start Analyzing Contracts
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0A0A0B] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Scale size={18} className="text-indigo-400" />
            PDF<span className="text-gray-500">OS</span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <div className="text-gray-500 text-sm">
              © 2026 PDF OS Intelligence. All rights reserved.
            </div>
            <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
              <Sparkles size={12} className="text-indigo-500/70" />
              Built from scratch by <span className="font-medium text-gray-300">Sayak Mondal</span>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
