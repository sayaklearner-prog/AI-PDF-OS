import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { KeyRound, ShieldCheck } from 'lucide-react';

export default function WebViewerComponent() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const { currentDocument, setWebViewerInstance } = useEditorStore();
  const [licenseKey, setLicenseKey] = useState<string>('demo:1781469243626:63fd63860300000000e91a8793b5f3083ce2b212f9a90fe5b707ac7676');
  const [isKeyValid, setIsKeyValid] = useState<boolean>(true);
  const [inputKey, setInputKey] = useState('');

  // Check for saved key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('apryse_license_key');
    if (savedKey) {
      setLicenseKey(savedKey);
      setIsKeyValid(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      localStorage.setItem('apryse_license_key', inputKey.trim());
      setLicenseKey(inputKey.trim());
      setIsKeyValid(true);
    }
  };
  // Initialize WebViewer
  useEffect(() => {
    let instance: any = null;

    const initWebViewer = async () => {
      if (viewerRef.current && isKeyValid && licenseKey) {
        try {
          const WebViewer = (await import('@pdftron/webviewer')).default;
          WebViewer({
            path: 'https://unpkg.com/@pdftron/webviewer@11.13.0/public',
            licenseKey: licenseKey,
          }, viewerRef.current).then((inst: any) => {
            instance = inst;
            const { UI, Core } = instance;
            
            setWebViewerInstance(instance);
            
            // Enable premium features in UI
            UI.enableFeatures([
              UI.Feature.Signatures,
              UI.Feature.Annotations,
              UI.Feature.TextSelection,
              UI.Feature.Search
            ]);
            
            // If there's a document, load it immediately
            if (currentDocument?.fileData) {
              const blob = new Blob([currentDocument.fileData], { type: 'application/pdf' });
              UI.loadDocument(blob, { filename: currentDocument.title || 'document.pdf' });
            }
          });

        } catch (error) {
          console.error("Error initializing WebViewer", error);
        }
      }
    };

    if (viewerRef.current && !instance && isKeyValid) {
      initWebViewer();
    }

    return () => {
      if (instance) {
        try {
          instance.dispose();
        } catch(e) {}
      }
    };
  }, [isKeyValid, licenseKey]);

  // Handle document changes after initialization
  useEffect(() => {
    const { webViewerInstance } = useEditorStore.getState();
    if (webViewerInstance && currentDocument?.fileData) {
      const blob = new Blob([currentDocument.fileData], { type: 'application/pdf' });
      webViewerInstance.UI.loadDocument(blob, { filename: currentDocument.title || 'document.pdf' });
    }
  }, [currentDocument]);

  if (!isKeyValid) {
    return (
      <div className="flex-1 w-full h-full bg-[#0F1117] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-[#1A1D24] p-8 rounded-2xl border border-white/10 shadow-xl text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
            <KeyRound size={32} className="text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Apryse WebViewer Key Required</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            To unlock the premium PDF engine and bypass the trial expiration, please provide your Apryse WebViewer License Key.
          </p>
          <input
            type="password"
            placeholder="Paste your license key here..."
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 mb-4 transition-colors"
          />
          <button
            onClick={handleSaveKey}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldCheck size={18} />
            Unlock Premium Viewer
          </button>
          <a href="https://dev.apryse.com/" target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 mt-6 underline underline-offset-4">
            Get a free trial key from dev.apryse.com
          </a>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="flex-1 w-full h-full flex items-center justify-center bg-[#0F1117] rounded-xl border border-white/10 shadow-2xl">
        <div className="text-gray-500 font-medium">Select a document to begin editing.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 flex flex-col relative">
      <div className="w-full h-full" ref={viewerRef}></div>
    </div>
  );
}
