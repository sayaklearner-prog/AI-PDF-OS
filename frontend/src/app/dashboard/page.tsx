'use client';

import React, { useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import HomeDashboard from '../../components/Dashboard/HomeDashboard';
import LeftSidebar from '../../components/Editor/LeftSidebar';
import WebViewerComponent from '../../components/Editor/WebViewerComponent';
import SettingsModal from '../../components/Dashboard/SettingsModal';
import WatermarkModal from '../../components/Editor/WatermarkModal';
import { 
  FolderOpen, Star, Share2, Shield, Settings, Activity, Sparkles, 
  Moon, Sun, HelpCircle, Laptop, ArrowRightLeft, Layers, QrCode, FileText 
} from 'lucide-react';
import { ExecutiveSummary } from '../../components/Dashboard/ExecutiveSummary';
import { ContractDashboard } from '../../components/Dashboard/ContractDashboard';
import { ClauseExplorer } from '../../components/Dashboard/ClauseExplorer';
import { ContractComparison } from '../../components/Dashboard/ContractComparison';

export default function RootPage() {
  const { 
    currentDocument, 
    activeTab,
    setActiveTab,
    showSettings,
    setShowSettings,
    userProfile
  } = useEditorStore();

  // Enforce Dark Mode permanently for premium AI visual design
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Monitor inbound QR scan events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const qrToken = urlParams.get('qr');
    if (qrToken) {
      // Clear parameter from URL cleanly
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      const logScan = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/qr/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: qrToken,
              device: 'Web Browser',
              location: 'San Francisco',
              country: 'US'
            })
          });
          if (res.ok) {
            alert(`🔗 Dynamic QR Code Scan Registered!\n\nToken: ${qrToken}\nRedirected to local workspace dashboard successfully.`);
          }
        } catch (err) {
          console.warn("Failed to log scan to NestJS backend", err);
        }
      };
      logScan();
    }
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* 1. Global Side Navigation Bar (Linear / Arc Browser Aesthetic) - Dashboard Mode Only */}
      {!currentDocument && (
        <div className="w-64 border-r border-white/5 flex flex-col h-full bg-black/20 backdrop-blur-xl select-none text-sm z-50 shadow-2xl">
          {/* Logo & Platform Title */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <span className="font-black text-lg tracking-tight text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-gradient-to-tr from-purple-600 to-cyan-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-purple-500/20">P</span>
              PDF OS
            </span>
            <span className="text-[10px] bg-white/10 font-bold px-2 py-1 rounded-md text-gray-400 border border-white/5">
              v2.0
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 p-4 space-y-1.5">
            <button className="w-full text-left py-2 px-3 rounded-xl font-semibold text-white bg-white/10 border border-white/5 flex items-center gap-3 shadow-inner">
              <FolderOpen size={16} className="text-purple-400" /> Documents
            </button>
            <button className="w-full text-left py-2 px-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors">
              <Star size={16} /> Starred Files
            </button>
            <button className="w-full text-left py-2 px-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors">
              <Share2 size={16} /> Shared Workspace
            </button>
            
            <span className="block h-px bg-white/5 my-4 mx-2" />
            
            <span className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">
              Modules
            </span>
            <button 
              onClick={() => alert("Please open or upload a document to manage its QR Campaign.")}
              className="w-full text-left py-2 px-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <QrCode size={16} /> QR Campaigns
            </button>
            <button 
              onClick={() => alert("Please open a document to manipulate pages.")}
              className="w-full text-left py-2 px-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <Layers size={16} /> Page Manipulation
            </button>
            <button 
              onClick={() => alert("Please open a document to use the converter suite.")}
              className="w-full text-left py-2 px-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <ArrowRightLeft size={16} /> PDF Converter
            </button>

            <span className="block h-px bg-white/5 my-4 mx-2" />

            <button 
              onClick={() => setShowSettings(true)}
              className="w-full text-left py-2 px-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <Settings size={16} /> Settings & Config
            </button>
          </div>

          {/* User profile section */}
          <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
            <div 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors w-full"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {userProfile.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="font-bold text-white text-xs truncate">{userProfile.name}</span>
                <span className="text-[10px] text-cyan-400 font-medium truncate">{userProfile.role}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Work Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {currentDocument ? (
          /* Editor Layout Mode using Apryse WebViewer */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* The LeftSidebar will contain our custom AI and QR tools. WebViewer contains its own UI tools. */}
            <div className="flex-1 flex overflow-hidden">
              <LeftSidebar />
              {activeTab === 'summary' ? (
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8 flex flex-col gap-6">
                  <ContractDashboard documentId={currentDocument.id} />
                  <ExecutiveSummary documentId={currentDocument.id} />
                  <ClauseExplorer documentId={currentDocument.id} />
                </div>
              ) : activeTab === 'compare' ? (
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8">
                  <ContractComparison />
                </div>
              ) : (
                <WebViewerComponent />
              )}
            </div>
          </div>
        ) : (
          /* Dashboard Layout Mode */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Dashboard top header */}
            <div className="h-16 border-b border-white/5 bg-black/10 backdrop-blur-md px-8 flex items-center justify-between z-40">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg max-w-sm w-80 shadow-inner">
                <span className="text-xs text-gray-500 font-mono font-bold">⌘K</span>
                <input
                  type="text"
                  placeholder="Ask AI or search documents..."
                  className="bg-transparent border-none text-sm text-white focus:outline-none placeholder-gray-500 w-full ml-2"
                />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <Shield size={14} className="fill-emerald-400/20" /> E2E Encrypted
                </span>
                
                <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                  <HelpCircle size={18} />
                </button>
              </div>
            </div>

            {/* Dashboard grid panel */}
            <HomeDashboard />
          </div>
        )}
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <WatermarkModal />
    </div>
  );
}
