import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';

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

  /**
   * Reads a raw PDF file, renders images for each page, and runs OCR.
   * Note: In a production app, we would use a robust PDF-to-Image library (e.g. pdf2pic or ghostscript).
   * For this MVP, we will assume images/buffers are passed directly, or we attempt standard parsing.
   */
  async processImageBuffer(imageBuffer: Buffer): Promise<string> {
    await this.initWorker();
    try {
      this.logger.log('Running OCR on page image...');
      const { data }: { data: Tesseract.Page } = await this.worker!.recognize(imageBuffer);
      return data.text;
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
