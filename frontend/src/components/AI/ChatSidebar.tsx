import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore, Message } from '../../store/editorStore';
import { Send, Sparkles, BookOpen, RotateCcw, AlertTriangle, FileText, CheckCircle, Volume2 } from 'lucide-react';

export default function ChatSidebar() {
  const { aiMessages, addAiMessage, isAiGenerating, setAiGenerating, currentDocument } = useEditorStore();
  const [input, setInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'graph' | 'audio'>('chat');
  const [ingestedDocId, setIngestedDocId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // Extract and ingest text on backend when a new document is opened
  useEffect(() => {
    if (!currentDocument || !currentDocument.fileData || ingestedDocId === currentDocument.id) {
      return;
    }

    const extractAndIngestText = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();

        const fileData = currentDocument.fileData!;
        const pdfDoc = await pdfjsLib.getDocument({ data: fileData.slice(0) }).promise;
        const pagesText: string[] = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          pagesText.push(pageText);
        }

        const ingestRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: currentDocument.id,
            pages: pagesText
          })
        });

        if (ingestRes.ok) {
          console.log(`Document text successfully indexed on backend for doc: ${currentDocument.id}`);
          setIngestedDocId(currentDocument.id);
        }
      } catch (err) {
        console.error("Text ingestion failed", err);
      }
    };

    extractAndIngestText();
  }, [currentDocument, ingestedDocId]);

  const handleSend = async () => {
    if (!input.trim() || isAiGenerating) return;
    
    const userQuery = input;
    // User Message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addAiMessage(userMsg);
    setInput('');
    setAiGenerating(true);

    // Command Intent Parsing
    const queryLower = userQuery.toLowerCase();
    
    // NAVIGATION COMMAND
    if (queryLower.includes('go to page')) {
      const match = queryLower.match(/page (\d+)/);
      const pageNum = match ? parseInt(match[1]) : 1;
      const { webViewerInstance } = useEditorStore.getState();
      if (webViewerInstance) {
        webViewerInstance.Core.documentViewer.setCurrentPage(pageNum);
      }
      addAiMessage({
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: `I've navigated the document to Page ${pageNum}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setAiGenerating(false);
      return;
    }

    // SIGNATURE ACTION
    if (queryLower.includes('signature') && (queryLower.includes('add') || queryLower.includes('paste'))) {
      addAiMessage({
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: 'I can add your signature to the document. Please review the preview and approve.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionPreview: { type: 'signature', payload: { x: 100, y: 100 } }
      });
      setAiGenerating(false);
      return;
    }

    // HIGHLIGHT ACTION
    if (queryLower.includes('highlight risk') || queryLower.includes('show risk')) {
      addAiMessage({
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: 'I found a Critical Risk (Auto-Renewal Clause) on Page 1. Shall I highlight it in Red?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionPreview: { type: 'highlight', payload: { page: 1, rect: { x: 50, y: 500, w: 400, h: 50 }, riskLevel: 'Critical' } }
      });
      setAiGenerating(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/contracts/${currentDocument?.id || 'doc-1'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery
        })
      });
      
      if (!response.ok) {
        throw new Error('AI Backend Query failed');
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        references: data.citations
      };
      addAiMessage(aiMsg);
      setAiGenerating(false);
    } catch (error) {
      console.warn("Backend AI query failed", error);
      
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: "I'm sorry, I could not reach the Contract Intelligence engine. Please check your connection or try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addAiMessage(errorMsg);
      setAiGenerating(false);
    }
  };

  const handleApproveAction = (msg: Message) => {
    const { webViewerInstance, updateAiMessage } = useEditorStore.getState();
    if (!webViewerInstance) return;

    const { annotationManager, documentViewer } = webViewerInstance.Core;
    const Annotations = webViewerInstance.Core.Annotations;

    if (msg.actionPreview?.type === 'signature') {
      const freeText = new Annotations.FreeTextAnnotation();
      freeText.PageNumber = 1;
      freeText.X = msg.actionPreview.payload.x;
      freeText.Y = msg.actionPreview.payload.y;
      freeText.Width = 150;
      freeText.Height = 50;
      freeText.setPadding(new Annotations.Rect(0, 0, 0, 0));
      freeText.setContents("Sayak Mondal (Signed)");
      freeText.FillColor = new Annotations.Color(0, 0, 0, 0);
      freeText.TextColor = new Annotations.Color(0, 0, 0);
      freeText.FontSize = '24pt';
      
      annotationManager.addAnnotation(freeText);
      annotationManager.redrawAnnotation(freeText);
    } 
    else if (msg.actionPreview?.type === 'highlight') {
      const payload = msg.actionPreview.payload;
      const highlight = new Annotations.TextHighlightAnnotation();
      highlight.PageNumber = payload.page;
      highlight.X = payload.rect.x;
      highlight.Y = payload.rect.y;
      highlight.Width = payload.rect.w;
      highlight.Height = payload.rect.h;
      
      if (payload.riskLevel === 'Critical') highlight.StrokeColor = new Annotations.Color(255, 0, 0);
      else if (payload.riskLevel === 'High') highlight.StrokeColor = new Annotations.Color(255, 165, 0);
      else highlight.StrokeColor = new Annotations.Color(255, 255, 0);

      annotationManager.addAnnotation(highlight);
      annotationManager.redrawAnnotation(highlight);
      documentViewer.setCurrentPage(payload.page);
    }

    updateAiMessage(msg.id, { actionApplied: true });
  };

  const runQuickAction = (action: string) => {
    setInput(action);
    setTimeout(() => {
      // Trigger send automatically
      const submitBtn = document.getElementById('chat-submit-btn');
      submitBtn?.click();
    }, 50);
  };

  return (
    <div className="flex flex-col h-full bg-card/10 text-sm">
      {/* Sub Tabs Selection (Chat vs Audio Narrator) */}
      <div className="flex border-b border-border/40 bg-secondary/20 p-1 gap-1">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex-1 py-1 rounded font-medium transition-all ${
            activeSubTab === 'chat' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          AI Document Chat
        </button>
        <button
          onClick={() => setActiveSubTab('audio')}
          className={`flex-1 py-1 rounded font-medium transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'audio' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Volume2 size={12} /> AI Podcast/Audio
        </button>
      </div>

      {activeSubTab === 'chat' ? (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {aiMessages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isAi ? 'self-start' : 'self-end ml-auto'}`}
                >
                  <div
                    className={`p-3.5 rounded-xl leading-relaxed shadow-sm ${
                      isAi
                        ? 'bg-[#1A1D24] text-gray-200 border border-white/5'
                        : 'bg-indigo-600 text-white font-medium shadow-indigo-500/20'
                    }`}
                  >
                    {isAi && (
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                        <Sparkles size={10} /> AI Copilot
                      </div>
                    )}
                    <div className="whitespace-pre-line text-[13.5px] font-medium opacity-95">{msg.text}</div>
                    
                    {/* References & Citations */}
                    {isAi && msg.references && msg.references.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-border/20 flex flex-col gap-1">
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase">Citations:</span>
                        {msg.references.map((ref, idx) => (
                          <div
                            key={idx}
                            onClick={() => runQuickAction(`Go to page ${ref.page + 1}`)}
                            className="flex items-center gap-1 text-[9px] text-accent/90 hover:underline cursor-pointer font-medium"
                          >
                            <BookOpen size={9} /> Page {ref.page + 1}: "{ref.text}"
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Approvals (Human-in-the-Loop) */}
                    {isAi && msg.actionPreview && !msg.actionApplied && (
                      <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col gap-2 shadow-inner">
                        <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertTriangle size={12} className="text-yellow-400" />
                          Pending Action: {msg.actionPreview.type}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleApproveAction(msg)} className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/25">
                            Approve Change
                          </button>
                        </div>
                      </div>
                    )}
                    {isAi && msg.actionApplied && (
                      <div className="mt-3 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-md border border-emerald-500/20">
                        <CheckCircle size={12} /> Applied to PDF
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isAiGenerating && (
              <div className="self-start max-w-[85%] flex flex-col gap-1">
                <div className="p-3 rounded-lg bg-secondary/40 border border-border/20 flex items-center gap-1.5 text-muted-foreground animate-pulse-slow">
                  <Sparkles size={12} className="text-accent animate-spin" />
                  AI is searching semantic memory index...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions Chips */}
          <div className="px-3 py-1 flex flex-wrap gap-1 border-t border-border/20 bg-secondary/10">
            <button
              onClick={() => runQuickAction('Summarize the document key points')}
              className="text-[9px] px-1.5 py-0.5 rounded border border-border/40 hover:bg-secondary text-muted-foreground hover:text-foreground"
            >
              📝 Summarize
            </button>
            <button
              onClick={() => runQuickAction('Analyze this contract for potential legal risks')}
              className="text-[9px] px-1.5 py-0.5 rounded border border-border/40 hover:bg-secondary text-muted-foreground hover:text-foreground"
            >
              ⚠️ Risk Audit
            </button>
            <button
              onClick={() => runQuickAction('Extract payment milestones and schedules')}
              className="text-[9px] px-1.5 py-0.5 rounded border border-border/40 hover:bg-secondary text-muted-foreground hover:text-foreground"
            >
              💵 Payments
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-border/40 bg-secondary/30 flex gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask document (e.g. When does it expire?)"
              className="flex-1 px-2.5 py-1.5 rounded-md border border-border/60 bg-card text-foreground focus:outline-none focus:border-accent text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              id="chat-submit-btn"
              onClick={handleSend}
              className="p-1.5 rounded-md bg-accent text-accent-foreground hover:opacity-90 flex items-center justify-center"
            >
              <Send size={13} />
            </button>
          </div>
        </>
      ) : (
        /* AI Podcast/Audio Panel (Acrobat-killer feature) */
        <div className="p-4 flex flex-col gap-3 text-center flex-1 justify-center items-center">
          <div className="p-3 rounded-full bg-accent/10 text-accent mb-1 animate-bounce">
            <Volume2 size={32} />
          </div>
          <h4 className="font-semibold text-foreground text-sm">AI Podcast Narrator</h4>
          <p className="text-muted-foreground text-[11px] leading-relaxed max-w-[200px] mx-auto">
            Convert this written PDF into a fully voiced, dual-host audio podcast discussion.
          </p>

          <div className="w-full mt-4 p-3 rounded-lg border border-border/40 bg-secondary/40 text-left flex flex-col gap-2">
            <span className="text-[10px] font-semibold text-accent uppercase">Simulated Episode Outline:</span>
            <div className="flex items-center gap-2 text-[10px] text-foreground">
              <FileText size={12} className="text-muted-foreground" />
              <span>Host A: Commercial leasing frameworks</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-foreground">
              <CheckCircle size={12} className="text-emerald-500" />
              <span>Host B: High-risk clause highlights</span>
            </div>

            <button
              onClick={() => alert("Simulated podcast generation complete! Voice TTS audio synthesis starting...")}
              className="mt-2 w-full py-1.5 rounded bg-accent text-accent-foreground font-semibold hover:opacity-95"
            >
              Generate AI Podcast (Audio)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
