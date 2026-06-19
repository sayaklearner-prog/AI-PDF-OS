import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { X, HelpCircle, Eye, Info } from 'lucide-react';

export default function WatermarkModal() {
  const { 
    currentDocument, 
    currentPage, 
    watermarkConfig, 
    setWatermarkConfig 
  } = useEditorStore();

  // Save initial watermark config for restoring on Cancel
  const initialConfig = useRef(watermarkConfig);

  const [pdfRendered, setPdfRendered] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render mini PDF page preview in the modal
  useEffect(() => {
    if (!watermarkConfig.showModal || !currentDocument || !currentDocument.fileData) return;

    let isCurrent = true;
    const renderMiniPreview = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();

        const pdfDoc = await pdfjsLib.getDocument({ data: currentDocument.fileData!.slice(0) }).promise;
        if (!isCurrent) return;

        const pageNum = Math.min(pdfDoc.numPages, currentPage + 1);
        const page = await pdfDoc.getPage(pageNum);
        if (!isCurrent) return;

        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        // Render at a small preview scale (e.g. scale 0.5)
        const viewport = page.getViewport({ scale: 0.5 });
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        if (isCurrent) {
          setPdfRendered(true);
        }
      } catch (err) {
        console.error('Preview PDF.js rendering failed', err);
      }
    };

    renderMiniPreview();
    return () => {
      isCurrent = false;
    };
  }, [watermarkConfig.showModal, currentDocument, currentPage]);

  if (!watermarkConfig.showModal) return null;

  const handleCancel = () => {
    // Restore original configuration
    setWatermarkConfig({ ...initialConfig.current, showModal: false });
  };

  const handleOk = () => {
    if (typeof window !== 'undefined' && (window as any).pendo) {
      (window as any).pendo.track("watermark_applied", {
        watermarkText: watermarkConfig.text,
        fontFamily: watermarkConfig.fontFamily,
        fontSize: watermarkConfig.fontSize,
        color: watermarkConfig.color,
        opacity: watermarkConfig.opacity,
        rotation: watermarkConfig.rotation,
        scale: watermarkConfig.scale,
        location: watermarkConfig.location,
        documentId: currentDocument?.id,
      });
    }
    // Close modal, saving current settings
    setWatermarkConfig({ showModal: false });
  };

  const updateConfig = (updates: Partial<typeof watermarkConfig>) => {
    setWatermarkConfig(updates);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 select-none font-sans text-xs">
      <div className="w-[850px] h-[550px] bg-[#f3f4f6] dark:bg-[#1f2937] border border-border/80 shadow-2xl rounded-lg overflow-hidden flex flex-col">
        {/* Header (Acrobat Pro DC Add Watermark theme) */}
        <div className="bg-[#e5e7eb] dark:bg-[#374151] border-b border-border p-3 px-4 flex items-center justify-between">
          <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
            <span className="w-4 h-4 rounded bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-black">W</span>
            Add Watermark
          </span>
          <button 
            onClick={handleCancel}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary/40"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal content body split screen */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL: Watermark Configuration options */}
          <div className="w-[55%] border-r border-border p-4 overflow-y-auto space-y-4 text-foreground/80 dark:text-foreground/90">
            {/* Source */}
            <fieldset className="border border-border/60 rounded-lg p-3 pt-2 bg-card/10">
              <legend className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-2">Source</legend>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="radio" id="src-text" name="wm-source" defaultChecked className="accent-accent" />
                  <label htmlFor="src-text" className="font-bold">Text:</label>
                  <input 
                    type="text" 
                    placeholder="CONFIDENTIAL" 
                    value={watermarkConfig.text} 
                    onChange={(e) => updateConfig({ text: e.target.value })}
                    className="flex-1 min-w-0 bg-white dark:bg-card border border-border/60 rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[10px] text-muted-foreground">Font</label>
                    <select
                      value={watermarkConfig.fontFamily}
                      onChange={(e) => updateConfig({ fontFamily: e.target.value })}
                      className="bg-white dark:bg-card border border-border/60 rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                    >
                      {['Inter', 'Roboto', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground">Size</label>
                    <input 
                      type="number" 
                      min="8" 
                      max="144" 
                      value={watermarkConfig.fontSize}
                      onChange={(e) => updateConfig({ fontSize: parseInt(e.target.value) || 24 })}
                      className="bg-white dark:bg-card border border-border/60 rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Font Color:</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={watermarkConfig.color}
                      onChange={(e) => updateConfig({ color: e.target.value })}
                      className="w-10 h-6 bg-white dark:bg-card border border-border/60 rounded px-0.5 cursor-pointer focus:outline-none"
                    />
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">{watermarkConfig.color}</span>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Appearance */}
            <fieldset className="border border-border/60 rounded-lg p-3 pt-2 bg-card/10">
              <legend className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-2">Appearance</legend>
              <div className="space-y-4">
                {/* Rotation */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Rotation angle:</span>
                    <span className="font-bold">{watermarkConfig.rotation}°</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => updateConfig({ rotation: -45 })}
                      className={`px-2 py-1 border rounded text-[10px] flex-1 ${watermarkConfig.rotation === -45 ? 'bg-accent/15 border-accent text-accent' : 'bg-white dark:bg-card border-border/60 hover:bg-secondary/40'}`}
                    >
                      -45°
                    </button>
                    <button 
                      onClick={() => updateConfig({ rotation: 0 })}
                      className={`px-2 py-1 border rounded text-[10px] flex-1 ${watermarkConfig.rotation === 0 ? 'bg-accent/15 border-accent text-accent' : 'bg-white dark:bg-card border-border/60 hover:bg-secondary/40'}`}
                    >
                      0° (None)
                    </button>
                    <button 
                      onClick={() => updateConfig({ rotation: 45 })}
                      className={`px-2 py-1 border rounded text-[10px] flex-1 ${watermarkConfig.rotation === 45 ? 'bg-accent/15 border-accent text-accent' : 'bg-white dark:bg-card border-border/60 hover:bg-secondary/40'}`}
                    >
                      45°
                    </button>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-[10px] text-muted-foreground">Custom:</span>
                      <input 
                        type="number" 
                        min="-180" 
                        max="180" 
                        value={watermarkConfig.rotation}
                        onChange={(e) => updateConfig({ rotation: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-white dark:bg-card border border-border/60 rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Opacity */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Opacity:</span>
                    <span className="font-bold">{Math.round(watermarkConfig.opacity * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={watermarkConfig.opacity * 100}
                      onChange={(e) => updateConfig({ opacity: parseFloat(e.target.value) / 100 })}
                      className="flex-1 accent-accent h-1.5 rounded bg-secondary"
                    />
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={Math.round(watermarkConfig.opacity * 100)}
                      onChange={(e) => updateConfig({ opacity: (parseInt(e.target.value) || 0) / 100 })}
                      className="w-12 bg-white dark:bg-card border border-border/60 rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Scale */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Scale relative to page:</span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      value={watermarkConfig.scale}
                      onChange={(e) => updateConfig({ scale: parseInt(e.target.value) || 100 })}
                      className="w-24 accent-accent h-1.5 rounded bg-secondary"
                    />
                    <span className="font-bold text-foreground">{watermarkConfig.scale}%</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-4 text-[10px] pt-1">
                  <span className="text-muted-foreground">Location:</span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="radio" 
                      id="loc-top" 
                      name="wm-location" 
                      checked={watermarkConfig.location === 'top'} 
                      onChange={() => updateConfig({ location: 'top' })}
                      className="accent-accent"
                    />
                    <label htmlFor="loc-top" className="font-semibold cursor-pointer">Appear on top of page</label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="radio" 
                      id="loc-behind" 
                      name="wm-location" 
                      checked={watermarkConfig.location === 'behind'} 
                      onChange={() => updateConfig({ location: 'behind' })}
                      className="accent-accent"
                    />
                    <label htmlFor="loc-behind" className="font-semibold cursor-pointer">Appear behind page</label>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Position */}
            <fieldset className="border border-border/60 rounded-lg p-3 pt-2 bg-card/10">
              <legend className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-2">Position</legend>
              <div className="space-y-3">
                {/* Vertical distance */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-[10px] text-muted-foreground">Vertical:</label>
                  <input 
                    type="number" 
                    value={watermarkConfig.verticalOffset}
                    onChange={(e) => updateConfig({ verticalOffset: parseInt(e.target.value) || 0 })}
                    className="bg-white dark:bg-card border border-border/60 rounded px-2 py-0.5 text-xs text-foreground focus:outline-none"
                    placeholder="Offset (px)"
                  />
                  <select
                    value={watermarkConfig.verticalAlign}
                    onChange={(e) => updateConfig({ verticalAlign: e.target.value as any })}
                    className="bg-white dark:bg-card border border-border/60 rounded px-1.5 py-0.5 text-[10px] text-foreground focus:outline-none"
                  >
                    <option value="center">from Center</option>
                    <option value="top">from Top</option>
                    <option value="bottom">from Bottom</option>
                  </select>
                </div>

                {/* Horizontal distance */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-[10px] text-muted-foreground">Horizontal:</label>
                  <input 
                    type="number" 
                    value={watermarkConfig.horizontalOffset}
                    onChange={(e) => updateConfig({ horizontalOffset: parseInt(e.target.value) || 0 })}
                    className="bg-white dark:bg-card border border-border/60 rounded px-2 py-0.5 text-xs text-foreground focus:outline-none"
                    placeholder="Offset (px)"
                  />
                  <select
                    value={watermarkConfig.horizontalAlign}
                    onChange={(e) => updateConfig({ horizontalAlign: e.target.value as any })}
                    className="bg-white dark:bg-card border border-border/60 rounded px-1.5 py-0.5 text-[10px] text-foreground focus:outline-none"
                  >
                    <option value="center">from Center</option>
                    <option value="left">from Left</option>
                    <option value="right">from Right</option>
                  </select>
                </div>
              </div>
            </fieldset>
          </div>

          {/* RIGHT PANEL: Live preview */}
          <div className="w-[45%] bg-[#dfdfdf] dark:bg-[#111827] flex flex-col p-4 justify-between items-center relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 flex items-center gap-1 self-start">
              <Eye size={12} /> Real-Time Preview
            </span>

            {/* Preview Frame */}
            <div className="relative border border-border shadow-md bg-white w-[250px] aspect-[1/1.3] rounded-sm flex items-center justify-center overflow-hidden select-none">
              {currentDocument?.fileData ? (
                <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
              ) : (
                <div className="text-[10px] text-muted-foreground p-4 text-center">
                  Preview Document Page Mockup
                </div>
              )}

              {/* Watermark Live Overlay */}
              {watermarkConfig.text && (
                <div 
                  className="absolute pointer-events-none select-none font-bold uppercase whitespace-nowrap"
                  style={{
                    left: watermarkConfig.horizontalAlign === 'left' ? `${watermarkConfig.horizontalOffset * 0.4}px` : watermarkConfig.horizontalAlign === 'right' ? 'auto' : '50%',
                    right: watermarkConfig.horizontalAlign === 'right' ? `${watermarkConfig.horizontalOffset * 0.4}px` : 'auto',
                    top: watermarkConfig.verticalAlign === 'top' ? `${watermarkConfig.verticalOffset * 0.4}px` : watermarkConfig.verticalAlign === 'bottom' ? 'auto' : '50%',
                    bottom: watermarkConfig.verticalAlign === 'bottom' ? `${watermarkConfig.verticalOffset * 0.4}px` : 'auto',
                    transform: `
                      translate(
                        ${watermarkConfig.horizontalAlign === 'center' ? '-50%' : '0px'}, 
                        ${watermarkConfig.verticalAlign === 'center' ? '-50%' : '0px'}
                      ) 
                      rotate(${watermarkConfig.rotation}deg) 
                      scale(${(watermarkConfig.scale / 100) * 0.4})
                    `,
                    opacity: watermarkConfig.opacity,
                    fontFamily: watermarkConfig.fontFamily,
                    fontSize: `${watermarkConfig.fontSize}px`,
                    color: watermarkConfig.color,
                    zIndex: watermarkConfig.location === 'behind' ? 0 : 10
                  }}
                >
                  {watermarkConfig.text}
                </div>
              )}
            </div>

            {/* Preview controls */}
            <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 bg-card/30 p-1.5 rounded border border-border/40">
              <Info size={11} className="text-accent" />
              <span>Preview page watermark scaling is optimized.</span>
            </div>
          </div>
        </div>

        {/* Footer (OK, Apply, Cancel) */}
        <div className="bg-[#e5e7eb] dark:bg-[#374151] border-t border-border p-3 px-4 flex items-center justify-end gap-2">
          <button 
            onClick={handleCancel}
            className="py-1 px-3 border border-border/80 bg-white dark:bg-card hover:bg-secondary/40 text-foreground font-semibold rounded text-xs transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleOk}
            className="py-1 px-3 bg-accent text-accent-foreground font-semibold rounded hover:opacity-90 text-xs transition-colors shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
