import React, { useState, useEffect } from 'react';
import { useEditorStore, PDFDocument } from '../../store/editorStore';
import { motion } from 'framer-motion';
import { 
  FileText, Star, Trash2, Upload, Sparkles, Folder, Zap, BrainCircuit, ShieldAlert, ArrowRightLeft, Target, Bot, CheckCircle2
} from 'lucide-react';

export default function HomeDashboard() {
  const { documentsList, setDocumentsList, setCurrentDocument, setActiveTab } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [runSteps, setRunSteps] = useState<{ name: string; status: 'pending' | 'running' | 'done' }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectDoc = (doc: PDFDocument, tab: 'pages' | 'summary' | 'ai' | 'compare' = 'summary') => {
    setCurrentDocument(doc);
    setActiveTab(tab);
  };

  const handleDeleteDoc = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (confirm("Delete document?")) {
      setDocumentsList(documentsList.filter((doc) => doc.id !== docId));
    }
  };

  const triggerBackendAnalysis = async (docId: string, file: File) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await fetch(`http://localhost:3001/ai/contracts/${docId}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64: base64 })
        });
      };
    } catch (e) {
      console.error("Failed to trigger analysis", e);
    }
  };

  const simulateWorkflowAutomation = (file: File) => {
    setUploadingFile(file.name);
    setRunSteps([{ name: 'Uploading to Deep Intelligence Engine...', status: 'running' as const }]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      let actualPageCount = Math.floor(Math.random() * 5 + 3);

      setRunSteps([{ name: 'Processing Document Streams...', status: 'done' }]);
      
      setTimeout(() => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const docId = `doc-${Date.now()}`;
        const newDoc: PDFDocument = {
          id: docId,
          title: file.name,
          fileSize: `${sizeMB} MB`,
          pageCount: actualPageCount,
          isStarred: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versionsCount: 1,
          fileData: arrayBuffer
        };
        
        triggerBackendAnalysis(docId, file);
        setDocumentsList([newDoc, ...documentsList]);
        setUploadingFile(null);
        setRunSteps([]);
        handleSelectDoc(newDoc, 'summary');
      }, 800);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.pdf')) {
      simulateWorkflowAutomation(file);
    } else if (file) {
      alert("Only PDF files are supported.");
    }
  };

  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial="hidden" animate="show" variants={containerVars}
      className="flex-1 flex flex-col p-8 overflow-y-auto space-y-10"
    >
      {/* AI HERO COMMAND CENTER */}
      <motion.div variants={itemVars} className="relative rounded-3xl overflow-hidden p-10 flex flex-col md:flex-row justify-between items-center bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-purple-300">
            <Sparkles size={12} className="text-purple-400" />
            PDF OS Intelligence Pipeline Active
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Analyze contracts. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Negotiate smarter.</span>
          </h1>
          <p className="text-base text-gray-400 font-medium">
            Upload your document and let our hybrid AI engine extract clauses, detect critical risks, and draft redlines instantly.
          </p>
        </div>

        <div className="relative z-10 mt-8 md:mt-0 w-full md:w-[340px]">
          <div 
            className={`p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center text-center justify-center min-h-[220px] backdrop-blur-md ${
              isDragging ? 'border-purple-500 bg-purple-500/10 scale-105 shadow-[0_0_40px_rgba(124,58,237,0.3)]' : 'border-white/20 bg-black/20 hover:border-purple-400/50 hover:bg-white/5'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file && file.name.endsWith('.pdf')) simulateWorkflowAutomation(file);
            }}
          >
            {uploadingFile ? (
              <div className="flex flex-col items-center space-y-4">
                <BrainCircuit size={48} className="text-purple-400 animate-pulse" />
                <span className="font-bold text-white tracking-wide">Processing Pipeline...</span>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
                </div>
              </div>
            ) : (
              <>
                <input type="file" id="hero-upload" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                <label htmlFor="hero-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <Upload size={24} className="text-white" />
                  </div>
                  <div className="space-y-1">
                    <span className="block font-bold text-lg text-white">Upload Contract</span>
                    <span className="block text-sm text-gray-400">PDF up to 50MB</span>
                  </div>
                </label>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ANALYTICS CARDS */}
      <motion.div variants={itemVars} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: "Contracts Processed", value: "1,240", icon: FileText, color: "from-blue-500/20 to-indigo-500/5", border: "border-blue-500/20", iconColor: "text-blue-400" },
          { title: "Critical Risks Found", value: "87", icon: ShieldAlert, color: "from-red-500/20 to-orange-500/5", border: "border-red-500/20", iconColor: "text-red-400" },
          { title: "Negotiation Edits", value: "432", icon: Target, color: "from-purple-500/20 to-fuchsia-500/5", border: "border-purple-500/20", iconColor: "text-purple-400" },
          { title: "Hours Saved", value: "2,300", icon: Zap, color: "from-emerald-500/20 to-teal-500/5", border: "border-emerald-500/20", iconColor: "text-emerald-400" },
        ].map((stat, i) => (
          <motion.div whileHover={{ y: -4, scale: 1.02 }} key={i} className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.border} backdrop-blur-lg flex items-center justify-between`}>
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${stat.iconColor}`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* AI-FIRST DOCUMENT GRID */}
      <motion.div variants={itemVars} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Folder className="text-indigo-400" />
            Intelligence Workspace
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {documentsList.map((doc) => (
            <motion.div 
              whileHover={{ y: -4 }}
              key={doc.id}
              className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl"
            >
              <div className="p-5 flex-1 cursor-pointer" onClick={() => handleSelectDoc(doc, 'pages')}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <FileText size={20} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-green-500/20 text-green-400 border border-green-500/20">
                    Analyzed
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 truncate">{doc.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                  <span>{doc.fileSize}</span> • 
                  <span>{doc.pageCount} Pages</span> •
                  <span>{mounted ? new Date(doc.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
              
              <div className="px-5 py-4 bg-black/20 border-t border-white/5 grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleSelectDoc(doc, 'summary')}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <ShieldAlert size={16} className="text-orange-400" />
                  <span className="text-[10px] font-bold uppercase">Summary</span>
                </button>
                <button 
                  onClick={() => handleSelectDoc(doc, 'ai')}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <Bot size={16} className="text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase">Copilot</span>
                </button>
                <button 
                  onClick={() => handleSelectDoc(doc, 'compare')}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowRightLeft size={16} className="text-purple-400" />
                  <span className="text-[10px] font-bold uppercase">Compare</span>
                </button>
              </div>
              
              {/* Floating Delete */}
              <button 
                onClick={(e) => handleDeleteDoc(e, doc.id)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
          {documentsList.length === 0 && (
            <div className="col-span-full p-12 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center text-center text-gray-500">
              <Folder size={48} className="mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No documents yet</h3>
              <p>Upload a contract above to initialize the AI analysis pipeline.</p>
            </div>
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}
