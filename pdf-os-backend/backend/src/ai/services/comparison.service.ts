import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { PrismaService } from '../../prisma.service';

export interface ComparisonDeviation {
  clauseTitle: string;
  baseText: string;
  targetText: string;
  deviationSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactExplanation: string;
}

export interface CompareResult {
  baseDocumentId: string;
  targetDocumentId: string;
  overallSimilarityScore: number;
  missingClauses: string[];
  deviations: ComparisonDeviation[];
  summary: string;
}

@Injectable()
export class ComparisonService {
  private readonly logger = new Logger(ComparisonService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService
  ) {}

  async compareContracts(baseDocumentId: string, targetDocumentId: string): Promise<CompareResult> {
    this.logger.log(`Comparing documents: ${baseDocumentId} vs ${targetDocumentId}`);

    // Fetch clauses for both documents
    const baseAnalysis = await this.prisma.contractAnalysis.findUnique({
      where: { documentId: baseDocumentId },
      include: { clauses: true }
    });

    const targetAnalysis = await this.prisma.contractAnalysis.findUnique({
      where: { documentId: targetDocumentId },
      include: { clauses: true }
    });

    if (!baseAnalysis || !targetAnalysis) {
      throw new Error('Both documents must be analyzed before comparison.');
    }

    const baseClausesText = baseAnalysis.clauses.map(c => `[${c.type || c.title}]: ${c.text}`).join('\n\n');
    const targetClausesText = targetAnalysis.clauses.map(c => `[${c.type || c.title}]: ${c.text}`).join('\n\n');

    const prompt = `
      You are an expert contract lawyer. Compare the Target Contract against the Base Contract.
      Identify missing clauses, structural differences, and shifted liabilities or obligations.
      
      BASE CONTRACT CLAUSES:
      ${baseClausesText}
      
      TARGET CONTRACT CLAUSES:
      ${targetClausesText}
      
      Provide a structured JSON response containing:
      1. overallSimilarityScore: A number from 0 to 100 estimating how similar they are.
      2. missingClauses: An array of strings describing important clauses present in the Base but missing in the Target.
      3. deviations: An array of objects, where each object has:
         - clauseTitle: string
         - baseText: string (brief summary)
         - targetText: string (brief summary of how it differs)
         - deviationSeverity: "LOW", "MEDIUM", "HIGH", or "CRITICAL"
         - impactExplanation: string (why this deviation matters)
      4. summary: A short paragraph summarizing the key differences.
    `;

    try {
      const result = await this.aiService.generateJson<CompareResult>(prompt, { maxTokens: 2500 });
      result.baseDocumentId = baseDocumentId;
      result.targetDocumentId = targetDocumentId;
      return result;
    } catch (e) {
      this.logger.error('Failed to generate contract comparison', e);
      throw new Error('Comparison engine failed.');
    }
  }
}
