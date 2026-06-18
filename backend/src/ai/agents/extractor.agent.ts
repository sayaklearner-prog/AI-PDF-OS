import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { OcrService } from '../services/ocr.service';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface ExtractionResult {
  contractType: string;
  parties: any;
  dates: any;
  clauses: Array<{ title: string; text: string; type: string; page: number }>;
}

@Injectable()
export class ExtractorAgent {
  private readonly logger = new Logger(ExtractorAgent.name);

  constructor(
    private readonly aiService: AiService,
    private readonly ocrService: OcrService
  ) {}

  async extractFromBuffer(pdfBuffer: Buffer): Promise<ExtractionResult> {
    this.logger.log('Starting Extractor Agent...');
    let text = '';
    
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        disableFontFace: true,
      });
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n';
      }
    } catch (error) {
      this.logger.error('pdfjs-dist text extraction failed', error);
      text = '';
    }

    // OCR Fallback threshold check
    if (text.trim().length < 100) {
      this.logger.warn('Text density too low. Triggering full OCR Pipeline (Google Lens style)...');
      try {
        const ocrText = await this.ocrService.processPdfBuffer(pdfBuffer);
        if (ocrText && ocrText.trim().length >= 100) {
          text = ocrText;
        } else {
          text = "SYSTEM ERROR: This document appears to be a scanned image or contains no readable text. You MUST output that the document is a scanned image and cannot be analyzed. Do not invent any contract details. Set all fields to indicate 'Scanned Image - Unreadable'.";
        }
      } catch (ocrError) {
        this.logger.error('Full OCR Pipeline failed', ocrError);
        text = "SYSTEM ERROR: This document appears to be a scanned image or contains no readable text, and the OCR engine failed to process it. You MUST output that the document is a scanned image and cannot be analyzed. Do not invent any contract details. Set all fields to indicate 'Scanned Image - Unreadable'.";
      }
    }

    this.logger.log(`Extracted ${text.length} characters. Running LLM extraction...`);

    const prompt = `
    Analyze the following legal contract text.
    Extract the following details in structured JSON format:
    1. contractType (e.g. "NDA", "SaaS Agreement", "Employment Agreement")
    2. parties (JSON array of parties involved)
    3. dates (JSON object containing effectiveDate, expirationDate)
    4. clauses (JSON array of objects containing 'title', 'text', 'type', and 'page').
       The 'type' must be one of: Termination, Liability, Indemnification, Confidentiality, IP Ownership, Payment Terms, Data Protection, Governing Law, Renewal, Assignment, Other.

    --- CONTRACT TEXT ---
    ${text.substring(0, 30000)} // Truncating for MVP context limits
    `;

    return await this.aiService.generateJson<ExtractionResult>(prompt, { maxTokens: 4000 });
  }
}
