import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ILlmProvider, LlmQueryOptions } from './providers/llm-provider.interface';
import { AiMlProvider } from './providers/aiml.provider';
import { FeatherlessProvider } from './providers/featherless.provider';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private primaryProvider: ILlmProvider;
  private secondaryProvider: ILlmProvider;
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    this.primaryProvider = new AiMlProvider();
    this.secondaryProvider = new FeatherlessProvider();
    
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    this.logger.log(`AI Service initialized with ${this.primaryProvider.getProviderName()} as primary provider.`);
  }

  // Abstraction for Provider execution
  async generateText(prompt: string, options?: LlmQueryOptions): Promise<string> {
    try {
      return await this.primaryProvider.generateText(prompt, options);
    } catch (error) {
      this.logger.warn(`Primary provider failed, falling back to ${this.secondaryProvider.getProviderName()}`);
      return await this.secondaryProvider.generateText(prompt, options);
    }
  }

  async generateJson<T>(prompt: string, options?: LlmQueryOptions): Promise<T> {
    try {
      return await this.primaryProvider.generateJson<T>(prompt, options);
    } catch (error) {
      this.logger.warn(`Primary provider JSON generation failed, falling back to ${this.secondaryProvider.getProviderName()}`);
      return await this.secondaryProvider.generateJson<T>(prompt, options);
    }
  }

  // Legacy Ingest for backward compatibility (Will be replaced by Vector search MVP in orchestrator)
  async ingestDocumentText(documentId: string, pages: string[]): Promise<boolean> {
    const filePath = path.join(this.uploadsDir, `${documentId}.json`);
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(pages), 'utf8');
      return true;
    } catch (err) {
      this.logger.error(`Failed to write text index: ${err.message}`);
      return false;
    }
  }

  // Legacy Chat for backward compatibility (Will be upgraded in vector.service)
  async queryDocument(documentId: string, query: string): Promise<{ reply: string; citations: any[] }> {
    const filePath = path.join(this.uploadsDir, `${documentId}.json`);
    let pages: string[] = [];
    if (fs.existsSync(filePath)) {
      try {
        pages = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
      } catch (err) {
        // ignore
      }
    }

    if (pages.length > 0) {
      const context = pages.map((text, idx) => `[Page ${idx + 1}]\n${text}`).join('\n\n').substring(0, 30000);
      const prompt = `Context:\n${context}\n\nQuestion: ${query}\nAnswer in detail and cite the page numbers used.`;
      
      try {
        const reply = await this.generateText(prompt, { temperature: 0.1 });
        const citations: any[] = [];
        const pageMatches = reply.match(/Page\s+(\d+)/gi);
        if (pageMatches) {
          const uniquePages = Array.from(new Set(pageMatches.map(m => parseInt(m.replace(/Page\s+/i, '')) - 1)));
          uniquePages.forEach(pIdx => {
            if (pIdx >= 0 && pIdx < pages.length) {
              citations.push({ page: pIdx, text: pages[pIdx].substring(0, 60) + '...' });
            }
          });
        }
        return { reply, citations };
      } catch (e) {
        this.logger.error('Query failed', e);
      }
    }
    
    return { reply: "I'm sorry, I couldn't find relevant information in the document.", citations: [] };
  }
}
