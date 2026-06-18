import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import DOMMatrix from 'dommatrix';

if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = DOMMatrix as any;
}

class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }
  reset(canvasAndContext: any, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext: any) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private worker: Tesseract.Worker | null = null;

  async initWorker() {
    if (!this.worker) {
      this.logger.log('Initializing Tesseract OCR worker...');
      this.worker = await Tesseract.createWorker('eng');
    }
  }

  async processPdfBuffer(pdfBuffer: Buffer): Promise<string> {
    await this.initWorker();
    this.logger.log('Rasterizing PDF into high-res images for OCR...');
    
    let fullText = '';
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        disableFontFace: true,
      });
      
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      const canvasFactory = new NodeCanvasFactory();

      for (let i = 1; i <= numPages; i++) {
        this.logger.log(`Running OCR on page ${i} of ${numPages}...`);
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2.0 scale for better OCR accuracy
        
        const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
        
        await page.render({
          canvasContext: canvasAndContext.context as any,
          viewport,
        } as any).promise;
        
        const imageBuffer = (canvasAndContext.canvas as any).toBuffer('image/png');
        const { data } = await this.worker!.recognize(imageBuffer);
        
        fullText += `\n[Page ${i}]\n${data.text}`;
        
        canvasFactory.destroy(canvasAndContext);
      }
      
      this.logger.log('OCR Pipeline complete.');
      return fullText;
    } catch (error) {
      this.logger.error('OCR processing failed', error);
      throw error;
    }
  }

  async close() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
