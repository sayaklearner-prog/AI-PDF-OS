import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * For the MVP, we use simple SQL LIKE / ILIKE queries against the extracted clauses.
   * In Phase 2, this will be upgraded to pgvector embeddings using the LLM provider.
   */
  async searchClauses(documentId: string, query: string, topK: number = 5) {
    this.logger.log(`Performing MVP semantic search for: "${query}" in doc ${documentId}`);

    const analysis = await this.prisma.contractAnalysis.findUnique({
      where: { documentId },
      include: { clauses: true }
    });

    if (!analysis || !analysis.clauses.length) {
      return [];
    }

    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    
    // Simplistic ranking based on term matching within Clause Text and Title
    const scoredClauses = analysis.clauses.map(clause => {
      let score = 0;
      const lowerText = clause.text.toLowerCase();
      const lowerTitle = (clause.title || '').toLowerCase();
      
      for (const term of queryTerms) {
        if (lowerText.includes(term)) score += 1;
        if (lowerTitle.includes(term)) score += 2; // Weight titles higher
      }
      return { clause, score };
    });

    return scoredClauses
      .filter(sc => sc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(sc => sc.clause);
  }
}
