import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { OcrService } from '../services/ocr.service';
import * as pdfParseRaw from 'pdf-parse';
const pdfParse = (pdfParseRaw as any).default || pdfParseRaw;

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
      const data = await pdfParse(pdfBuffer);
      text = data.text;
    } catch (error) {
      this.logger.error('pdf-parse failed, falling back to OCR', error);
      text = '';
    }

    // OCR Fallback threshold check (e.g. less than 100 characters usually implies a scanned image)
    if (text.trim().length < 100) {
      this.logger.warn('Text density too low. Triggering OCR Fallback...');
      // In a real app we'd convert the PDF pages to images. Here we simulate passing a buffer
      // that the OCR service would read. For MVP simplicity, we might just throw or mock
      // as tesseract requires image inputs, not PDF.
      // text = await this.ocrService.processImageBuffer(pdfBuffer); // Needs image conversion
      text = "OCR Placeholder text. Contract text extracted from scan.";
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
