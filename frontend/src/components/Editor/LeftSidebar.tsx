import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { Sparkles, QrCode, Smartphone, Zap, RefreshCw, FileText, ArrowRightLeft, Bot, Edit3 } from 'lucide-react';
import ChatSidebar from '../AI/ChatSidebar';
import SidebarSummary from '../Dashboard/SidebarSummary';
import { motion } from 'framer-motion';

export default function LeftSidebar() {
  const { 
    currentDocument,
    activeTab,
    setActiveTab,
    qrConfig,
    setQrConfig,
    qrScansData,
    setQrScansData
  } = useEditorStore();

  const [isGenerating, setIsGenerating] = useState(false);

  const publishDocumentToQr = async () => {
    if (!currentDocument || !currentDocument.fileData) return;
    setIsGenerating(true);
    try {
      const blob = new Blob([currentDocument.fileData.slice(0)], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('files', blob, currentDocument.title);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/documents/publish`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Backend publish failed');

      const data = await response.json();
      if (data.qrCodeDataUrl) {
        setQrConfig({
          qrToken: data.token,
          qrCodeDataUrl: data.qrCodeDataUrl,
          redirectUrl: data.redirectUrl
        });
        if (typeof window !== 'undefined' && (window as any).pendo) {
          (window as any).pendo.track("document_published_to_qr", {
            documentId: currentDocument?.id,
            documentTitle: currentDocument?.title,
            qrToken: data.token,
            redirectUrl: data.redirectUrl,
            success: true,
          });
        }
      }
    } catch (error) {
      console.error("Failed to publish document to QR", error);
      if (typeof window !== 'undefined' && (window as any).pendo) {
        (window as any).pendo.track("document_published_to_qr", {
          documentId: currentDocument?.id,
          documentTitle: currentDocument?.title,
          success: false,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!qrConfig.qrToken) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/qr/stats/${qrConfig.qrToken}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.scans) setQrScansData(data.scans);
      } catch (err) {
        console.warn("Failed to fetch live stats", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [qrConfig.qrToken, setQrScansData]);

  const tabsList: { tab: 'ai' | 'qr' | 'summary' | 'compare'; label: string; icon: React.ReactNode }[] = [
    { tab: 'summary', label: 'Summary', icon: <FileText size={18} /> },
    { tab: 'ai', label: 'Copilot', icon: <Bot size={18} /> },
    { tab: 'compare', label: 'Compare', icon: <ArrowRightLeft size={18} /> },
    { tab: 'qr', label: 'Campaign', icon: <QrCode size={18} /> },
  ];

  useEffect(() => {
    if (activeTab !== 'ai' && activeTab !== 'qr' && activeTab !== 'summary' && activeTab !== 'compare') {
      setActiveTab('ai');
    }
  }, [activeTab, setActiveTab]);

  return (
    <div className="flex h-full select-none text-xs border-r border-white/5 bg-black/40 backdrop-blur-xl z-20 shadow-2xl relative">
      
      {/* Sidebar Navigation Icons */}
      <div className="w-20 border-r border-white/5 bg-[#0b0f19]/80 flex flex-col gap-3 p-3 items-center z-10 py-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 mb-6 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles size={24} className="text-white" />
        </div>
        
        {tabsList.map((t) => {
          const isActive = activeTab === t.tab;
          return (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={t.tab}
              onClick={() => setActiveTab(t.tab)}
              className={`w-full aspect-square rounded-2xl transition-all flex flex-col items-center justify-center gap-1.5 relative group ${
                isActive 
                  ? 'text-white bg-white/10 shadow-inner border border-white/10' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
              title={t.label}
            >
              {isActive && <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#06B6D4]" />}
              {t.icon}
              <span className="text-[10px] font-semibold tracking-wider uppercase">{t.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Main Tab Panel Viewport */}
      <div className="w-80 flex flex-col overflow-y-auto bg-transparent relative">
        
        {/* Subtle inner shadow overlay */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_20px_0_40px_rgba(0,0,0,0.3)] z-0" />
        
        <div className="relative z-10 h-full flex flex-col">
          {activeTab === 'ai' && <ChatSidebar />}

          {activeTab === 'summary' && currentDocument && (
            <SidebarSummary documentId={currentDocument.id} />
          )}

          {activeTab === 'compare' && currentDocument && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <ArrowRightLeft size={48} className="mb-4 text-cyan-500/30" />
              <p className="text-sm font-medium">Contract Comparison Tool is active in the main viewport.</p>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="p-6 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                <QrCode size={16} className="text-purple-400" />
                Live Campaign
              </h3>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center space-y-4 backdrop-blur-md">
                {qrConfig.qrCodeDataUrl ? (
                  <>
                    <div className="bg-white p-3 rounded-xl shadow-lg shadow-purple-500/20">
                      <img src={qrConfig.qrCodeDataUrl} alt="Document QR Code" className="w-32 h-32 object-contain" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-bold text-white text-sm">Campaign Active</p>
                      <p className="text-[11px] text-gray-400">Scan to stream document securely.</p>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Scans</span>
                        <span className="text-2xl font-black text-cyan-400">{qrScansData.length}</span>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Status</span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5"><Zap size={12} className="fill-emerald-400" /> LIVE</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center shadow-inner">
                      <Smartphone size={32} className="text-gray-600" />
                    </div>
                    <p className="text-center text-xs text-gray-400 font-medium leading-relaxed px-2">
                      Publish to cloud to generate a secure streaming QR Code.
                    </p>
                    <button 
                      onClick={publishDocumentToQr}
                      disabled={isGenerating}
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                      {isGenerating ? 'Publishing...' : 'Publish to Edge'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
