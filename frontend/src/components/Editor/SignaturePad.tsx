import React, { useState, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { Edit3, Type, Upload, Trash2, Check } from 'lucide-react';

interface SignaturePadProps {
  onClose: () => void;
}

export default function SignaturePad({ onClose }: SignaturePadProps) {
  const { addSignature, savedSignatures } = useEditorStore();
  const [activeMode, setActiveMode] = useState<'draw' | 'type' | 'upload'>('draw');
  
  // Draw Mode refs & states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Type Mode states
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState<'cursive' | 'serif' | 'signature'>('cursive');

  // Draw Canvas Event Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep charcoal/black
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    addSignature({ dataUrl, type: 'draw' });
    if (typeof window !== 'undefined' && (window as any).pendo) {
      (window as any).pendo.track("signature_created", {
        signatureType: 'draw',
      });
    }
    alert("Signature captured from drawing canvas.");
    onClose();
  };

  const handleSaveType = () => {
    if (!typedName.trim()) return;
    
    // Render text to canvas to get a PNG DataURL for the signature stamp overlay
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f172a';
      
      const fontName = selectedFont === 'cursive' ? 'cursive, Brush Script MT' : selectedFont === 'serif' ? 'Georgia, serif' : 'system-ui';
      ctx.font = `italic 36px ${fontName}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 150, 50);
    }
    
    const dataUrl = canvas.toDataURL();
    addSignature({ dataUrl, type: 'type' });
    if (typeof window !== 'undefined' && (window as any).pendo) {
      (window as any).pendo.track("signature_created", {
        signatureType: 'type',
        selectedFont,
      });
    }
    alert("Calligraphy signature generated and saved.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-[420px] rounded-xl glass border border-border/60 shadow-2xl p-5 flex flex-col gap-4 text-xs animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
            Create Signature
          </h3>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-bold text-sm"
          >
            ×
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border/40 p-0.5 bg-secondary/30 rounded-lg gap-1">
          <button
            onClick={() => setActiveMode('draw')}
            className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1 transition-all ${
              activeMode === 'draw' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 size={12} /> Draw
          </button>
          <button
            onClick={() => setActiveMode('type')}
            className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1 transition-all ${
              activeMode === 'type' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Type size={12} /> Type
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1 transition-all ${
              activeMode === 'upload' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload size={12} /> Upload
          </button>
        </div>

        {/* Canvas / Input Panel */}
        <div className="h-[140px] border border-border/60 rounded-lg overflow-hidden bg-white dark:bg-card/40 flex items-center justify-center relative shadow-inner">
          {activeMode === 'draw' && (
            <>
              <canvas
                ref={canvasRef}
                width={380}
                height={138}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair w-full h-full"
              />
              <button
                onClick={clearCanvas}
                className="absolute top-2 right-2 p-1.5 rounded bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Clear Signature Canvas"
              >
                <Trash2 size={11} />
              </button>
            </>
          )}

          {activeMode === 'type' && (
            <div className="w-full p-4 flex flex-col gap-3">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your name"
                className="w-full px-2.5 py-1.5 rounded border border-border/60 bg-card text-foreground font-medium focus:outline-none focus:border-accent text-xs"
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setSelectedFont('cursive')}
                  className={`px-2 py-0.5 rounded border text-[10px] ${
                    selectedFont === 'cursive' ? 'border-accent bg-accent/5 font-bold text-accent' : 'border-border/40 text-muted-foreground'
                  }`}
                  style={{ fontFamily: 'Brush Script MT, cursive' }}
                >
                  Cursive Signature
                </button>
                <button
                  onClick={() => setSelectedFont('serif')}
                  className={`px-2 py-0.5 rounded border text-[10px] ${
                    selectedFont === 'serif' ? 'border-accent bg-accent/5 font-bold text-accent' : 'border-border/40 text-muted-foreground'
                  }`}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Serif Signature
                </button>
              </div>
            </div>
          )}

          {activeMode === 'upload' && (
            <div className="flex flex-col items-center justify-center text-center gap-1.5 p-4">
              <Upload size={18} className="text-muted-foreground" />
              <span className="font-semibold text-foreground text-[10px]">Select signature image</span>
              <span className="text-[9px] text-muted-foreground leading-normal max-w-[150px]">
                Accepts PNG format with transparent backgrounds.
              </span>
              <input
                type="file"
                accept="image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      addSignature({ dataUrl: event.target?.result as string, type: 'upload' });
                      if (typeof window !== 'undefined' && (window as any).pendo) {
                        (window as any).pendo.track("signature_uploaded", {
                          fileType: file.type,
                          fileName: file.name,
                        });
                      }
                      alert("Uploaded signature image.");
                      onClose();
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="signature-file"
              />
              <label htmlFor="signature-file" className="mt-1 cursor-pointer py-1 px-3.5 rounded bg-secondary hover:bg-border text-foreground font-semibold text-[10px]">
                Browse File
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <button
            onClick={onClose}
            className="py-1.5 px-3 rounded-lg border border-border/60 hover:bg-secondary text-foreground font-semibold"
          >
            Cancel
          </button>
          
          {activeMode === 'draw' && (
            <button
              onClick={handleSaveDraw}
              className="py-1.5 px-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 flex items-center gap-0.5"
            >
              <Check size={12} /> Save drawn signature
            </button>
          )}

          {activeMode === 'type' && (
            <button
              onClick={handleSaveType}
              className="py-1.5 px-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 flex items-center gap-0.5"
              disabled={!typedName.trim()}
            >
              <Check size={12} /> Save calligraphy signature
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
