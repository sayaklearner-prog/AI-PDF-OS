import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiService } from './ai.service';
import { ContractPipelineService } from './orchestrator/contract-pipeline.service';
import { VectorService } from './services/vector.service';
import { ComparisonService } from './services/comparison.service';
import { PrismaService } from '../prisma.service';

declare var pendo: { trackAgent: (eventType: string, metadata: object) => void };

enum AnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly pipelineService: ContractPipelineService,
    private readonly vectorService: VectorService,
    private readonly comparisonService: ComparisonService,
    private readonly prisma: PrismaService
  ) {}

  @Post('contracts/:id/analyze')
  async analyzeContract(
    @Param('id') documentId: string,
    @Body('pdfBase64') pdfBase64: string // For MVP, passing base64. In prod, fetch from S3/storage
  ) {
    const buffer = Buffer.from(pdfBase64, 'base64');
    
    // Fire and forget - runs asynchronously
    this.pipelineService.runPipeline(documentId, buffer);
    
    return { message: 'Contract analysis started', documentId };
  }

  @Get('contracts/:id/status')
  async getAnalysisStatus(@Param('id') documentId: string) {
    const analysis = await this.prisma.contractAnalysis.findUnique({
      where: { documentId }
    });

    if (!analysis) {
      return {
        status: 'PENDING',
        progressPercentage: 0,
        errorMessage: null
      };
    }

    return {
      status: analysis.analysisStatus,
      progressPercentage: analysis.progressPercentage,
      errorMessage: analysis.errorMessage
    };
  }

  @Get('contracts/:id/summary')
  async getExecutiveSummary(@Param('id') documentId: string) {
    const analysis = await this.prisma.contractAnalysis.findUnique({
      where: { documentId }
    });

    if (!analysis || !analysis.executiveSummary) {
      return null;
    }

    return {
      contractType: analysis.contractType,
      parties: analysis.parties ? JSON.parse(analysis.parties as string) : null,
      dates: analysis.dates ? JSON.parse(analysis.dates as string) : null,
      executiveSummary: analysis.executiveSummary ? JSON.parse(analysis.executiveSummary as string) : null
    };
  }

  @Post('contracts/:id/chat')
  async contractChat(
    @Param('id') documentId: string,
    @Body('query') query: string
  ) {
    const conversationId = documentId;

    pendo.trackAgent("prompt", {
      agentId: "5MAmB615fLf8YVF6Qc2K4d6JTh4",
      conversationId,
      messageId: randomUUID(),
      content: query,
    });

    // 1. Semantic Search for relevant clauses
    const relevantClauses = await this.vectorService.searchClauses(documentId, query, 5);

    if (relevantClauses.length === 0) {
      // Fallback to old full-text search if no clauses exist
      const result = await this.aiService.queryDocument(documentId, query);

      pendo.trackAgent("agent_response", {
        agentId: "5MAmB615fLf8YVF6Qc2K4d6JTh4",
        conversationId,
        messageId: randomUUID(),
        content: result.reply,
        modelUsed: "gpt-4o",
      });

      return result;
    }

    // 2. Build RAG Context
    const context = relevantClauses.map((c, i) => `[Page ${c.page}] ${c.title || c.type}: ${c.text}`).join('\n\n');

    // 3. Query LLM
    const prompt = `
      You are an expert legal counsel assisting a user with their contract.
      Answer the user's question accurately using ONLY the provided context clauses.
      Cite the page numbers of the clauses you use to formulate your answer.
      
      Context Clauses:
      ${context}

      Question: ${query}
    `;

    const reply = await this.aiService.generateText(prompt, { temperature: 0.1 });
    
    const citations = relevantClauses.map(c => ({
      page: c.page,
      text: c.title || c.type || c.text.substring(0, 50)
    }));

    pendo.trackAgent("agent_response", {
      agentId: "5MAmB615fLf8YVF6Qc2K4d6JTh4",
      conversationId,
      messageId: randomUUID(),
      content: reply,
      modelUsed: "gpt-4o",
    });

    return { reply, citations };
  }
  @Get('contracts/:id/clauses')
  async getContractClauses(@Param('id') documentId: string) {
    const analysis = await this.prisma.contractAnalysis.findUnique({
      where: { documentId },
      include: { clauses: true }
    });

    if (!analysis) {
      // Return empty array if analysis hasn't started yet instead of 404
      return [];
    }

    return analysis.clauses;
  }

  @Post('contracts/clauses/:clauseId/accept-rewrite')
  async acceptRewrite(@Param('clauseId') clauseId: string) {
    const clause = await this.prisma.clause.findUnique({
      where: { id: clauseId },
      include: { contractAnalysis: true },
    });
    if (!clause) throw new NotFoundException('Clause not found');

    pendo.trackAgent("user_reaction", {
      agentId: "5MAmB615fLf8YVF6Qc2K4d6JTh4",
      conversationId: clause.contractAnalysis.documentId,
      messageId: clauseId,
      content: "positive",
    });

    return this.prisma.clause.update({
      where: { id: clauseId },
      data: {
        rewriteStatus: 'ACCEPTED',
      }
    });
  }

  @Post('contracts/clauses/:clauseId/reject-rewrite')
  async rejectRewrite(@Param('clauseId') clauseId: string) {
    const clause = await this.prisma.clause.findUnique({
      where: { id: clauseId },
      include: { contractAnalysis: true },
    });
    if (!clause) throw new NotFoundException('Clause not found');

    pendo.trackAgent("user_reaction", {
      agentId: "5MAmB615fLf8YVF6Qc2K4d6JTh4",
      conversationId: clause.contractAnalysis.documentId,
      messageId: clauseId,
      content: "negative",
    });

    return this.prisma.clause.update({
      where: { id: clauseId },
      data: { rewriteStatus: 'REJECTED' }
    });
  }

  @Post('contracts/compare')
  async compareContracts(@Body('baseDocumentId') baseDocId: string, @Body('targetDocumentId') targetDocId: string) {
    return this.comparisonService.compareContracts(baseDocId, targetDocId);
  }

  // Legacy endpoints to prevent breaking existing UI temporarily
  @Post('query')
  async queryDocument(@Body('documentId') documentId: string, @Body('query') query: string) {
    pendo.trackAgent("prompt", {
      agentId: "5MAmB615fLf8YVF6Qc2K4d6JTh4",
      conversationId: documentId,
      messageId: randomUUID(),
      content: query,
    });

    const result = await this.aiService.queryDocument(documentId, query);

    pendo.trackAgent("agent_response", {
      agentId: "5MAmB615fLf8YVF6Qc2K4d6JTh4",
      conversationId: documentId,
      messageId: randomUUID(),
      content: result.reply,
      modelUsed: "gpt-4o",
    });

    return result;
  }

  @Post('ingest')
  async ingestDocument(@Body('documentId') documentId: string, @Body('pages') pages: string[]) {
    return { success: await this.aiService.ingestDocumentText(documentId, pages) };
  }
}
