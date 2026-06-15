import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ExtractorAgent } from '../agents/extractor.agent';
import { RiskAgent } from '../agents/risk.agent';
import { SummaryAgent } from '../agents/summary.agent';
import { NegotiationAgent } from '../agents/negotiation.agent';
import { OcrService } from '../services/ocr.service';
enum AnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

enum RewriteStatus {
  SUGGESTED = 'SUGGESTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

@Injectable()
export class ContractPipelineService {
  private readonly logger = new Logger(ContractPipelineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly extractorAgent: ExtractorAgent,
    private readonly riskAgent: RiskAgent,
    private readonly summaryAgent: SummaryAgent,
    private readonly negotiationAgent: NegotiationAgent,
    private readonly ocrService: OcrService
  ) {}

  async runPipeline(documentId: string, pdfBuffer: Buffer) {
    this.logger.log(`Starting pipeline for document: ${documentId}`);

    // Ensure user exists
    let user = await this.prisma.user.findFirst();
    if (!user) {
      user = await this.prisma.user.create({ data: { name: 'Admin', email: 'admin@pdfos.com' } });
    }

    // Ensure document exists to avoid Foreign Key constraint violations
    await this.prisma.document.upsert({
      where: { id: documentId },
      create: {
        id: documentId,
        title: 'Uploaded via UI',
        fileUrl: `/uploads/${documentId}.pdf`,
        fileSize: pdfBuffer.length,
        ownerId: user.id
      },
      update: {} // Do nothing if it exists
    });

    // Create or update the ContractAnalysis record
    let analysis = await this.prisma.contractAnalysis.upsert({
      where: { documentId },
      create: { documentId, analysisStatus: AnalysisStatus.PROCESSING, progressPercentage: 5 },
      update: { analysisStatus: AnalysisStatus.PROCESSING, progressPercentage: 5, errorMessage: null }
    });

    try {
      // Step 1: Extraction & OCR
      this.logger.log('Step 1: Extractor Agent');
      const extraction = await this.extractorAgent.extractFromBuffer(pdfBuffer);
      
      analysis = await this.prisma.contractAnalysis.update({
        where: { id: analysis.id },
        data: {
          contractType: extraction.contractType,
          parties: JSON.stringify(extraction.parties || []),
          dates: JSON.stringify(extraction.dates || {}),
          progressPercentage: 35
        }
      });

      // Step 2: Risk Analysis
      this.logger.log('Step 2: Risk Agent');
      const evaluatedClauses = await this.riskAgent.evaluateClauses(extraction.clauses, extraction.contractType);
      
      // Save clauses to DB and trigger negotiation if risky
      for (const clause of evaluatedClauses) {
        let rewriteStatus = null;
        let proposedRewriteText = null;
        let rewriteExplanation = null;

        if (clause.severity === 'High' || clause.severity === 'Critical') {
          this.logger.log(`Step 2.5: Negotiation Agent for risky clause: ${clause.title}`);
          try {
            const rewrite = await this.negotiationAgent.generateRewrite(clause, extraction.contractType, extraction.parties);
            proposedRewriteText = rewrite.proposedRewrite;
            rewriteExplanation = rewrite.explanation;
            rewriteStatus = RewriteStatus.SUGGESTED;
          } catch (e) {
            this.logger.warn(`Failed to generate rewrite for clause: ${clause.title}`, e);
          }
        }

        await this.prisma.clause.create({
          data: {
            contractAnalysisId: analysis.id,
            title: clause.title,
            text: clause.text,
            type: clause.type,
            page: clause.page,
            confidence: 0.95, // mock confidence
            riskScore: clause.riskScore,
            riskSeverity: clause.severity,
            businessImpact: clause.impact,
            recommendation: clause.recommendation,
            rewriteStatus: rewriteStatus,
            proposedRewrite: proposedRewriteText,
            rewriteExplanation: rewriteExplanation
          }
        });
      }

      await this.prisma.contractAnalysis.update({
        where: { id: analysis.id },
        data: { progressPercentage: 70 }
      });

      // Step 3: Executive Summary
      this.logger.log('Step 3: Summary Agent');
      const summary = await this.summaryAgent.generateSummary(extraction.contractType, extraction.parties, extraction.dates, evaluatedClauses);
      
      await this.prisma.contractAnalysis.update({
        where: { id: analysis.id },
        data: { 
          executiveSummary: JSON.stringify(summary),
          progressPercentage: 100,
          analysisStatus: AnalysisStatus.COMPLETED,
          completedAt: new Date()
        }
      });

      this.logger.log(`Pipeline completed successfully for document: ${documentId}`);

    } catch (error) {
      this.logger.error(`Pipeline failed for document ${documentId}`, error);
      await this.prisma.contractAnalysis.update({
        where: { documentId },
        data: {
          analysisStatus: AnalysisStatus.FAILED,
          errorMessage: error.message || 'Unknown error occurred during processing.'
        }
      });
    }
  }
}
