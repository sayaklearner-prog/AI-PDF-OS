import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // Merge multiple PDF buffers together
  async mergeDocuments(buffers: Buffer[]): Promise<Buffer> {
    this.logger.log(`Merging ${buffers.length} documents...`);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const buffer of buffers) {
        const srcPdf = await PDFDocument.load(buffer);
        const pages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const savedBytes = await mergedPdf.save();
      return Buffer.from(savedBytes);
    } catch (error) {
      this.logger.error('Error merging documents', error);
      throw new Error(`PDF Merge failed: ${error.message}`);
    }
  }

  // Split a PDF by custom page range
  async splitDocument(buffer: Buffer, ranges: number[]): Promise<Buffer> {
    this.logger.log(`Extracting pages ${ranges.join(', ')} from PDF...`);
    try {
      const srcPdf = await PDFDocument.load(buffer);
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(srcPdf, ranges);
      pages.forEach((page) => newPdf.addPage(page));
      
      const savedBytes = await newPdf.save();
      return Buffer.from(savedBytes);
    } catch (error) {
      this.logger.error('Error splitting document', error);
      throw new Error(`PDF Split failed: ${error.message}`);
    }
  }

  // Compress a PDF by stripping metadata and compressing streams
  async compressDocument(buffer: Buffer, quality: 'low' | 'medium' | 'high' | 'extreme'): Promise<{ buffer: Buffer; ratio: number }> {
    this.logger.log(`Compressing PDF with quality mode: ${quality}`);
    try {
      const doc = await PDFDocument.load(buffer);
      // Stripping metadata, catalog details, or optional content groups
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setCreator('');
      doc.setProducer('');
      
      const compressedBytes = await doc.save({
        useObjectStreams: true,
      });

      const originalSize = buffer.length;
      const compressedSize = compressedBytes.length;
      const ratio = Math.max(0, 1 - (compressedSize / originalSize));

      return {
        buffer: Buffer.from(compressedBytes),
        ratio
      };
    } catch (error) {
      this.logger.error('Error compressing document', error);
      throw new Error(`PDF Compression failed: ${error.message}`);
    }
  }

  // Inject a visual text watermark overlay onto every page
  async addWatermark(buffer: Buffer, text: string, opacity = 0.2): Promise<Buffer> {
    this.logger.log(`Injecting watermark "${text}" with opacity ${opacity}...`);
    try {
      const doc = await PDFDocument.load(buffer);
      const pages = doc.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(text, {
          x: width / 4,
          y: height / 2,
          size: 50,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity,
          rotate: degrees(45),
        });
      }

      const savedBytes = await doc.save();
      return Buffer.from(savedBytes);
    } catch (error) {
      this.logger.error('Error injecting watermark', error);
      throw new Error(`Watermark injection failed: ${error.message}`);
    }
  }

  async saveUploadedFile(buffer: Buffer, docId: string): Promise<string> {
    const filePath = path.join(this.uploadsDir, `${docId}.pdf`);
    this.logger.log(`Saving uploaded PDF file to disk: ${filePath}`);
    try {
      await fs.promises.writeFile(filePath, buffer);
      return filePath;
    } catch (error) {
      this.logger.error(`Failed to save file to filesystem: ${error.message}`);
      throw new Error(`Disk write failed: ${error.message}`);
    }
  }

  async getFileBuffer(docId: string): Promise<Buffer> {
    const filePath = path.join(this.uploadsDir, `${docId}.pdf`);
    this.logger.log(`Reading PDF file from disk: ${filePath}`);
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File does not exist on disk.');
      }
      return await fs.promises.readFile(filePath);
    } catch (error) {
      this.logger.error(`Failed to read file from filesystem: ${error.message}`);
      throw new Error(`Disk read failed: ${error.message}`);
    }
  }
}
