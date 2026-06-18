import { Injectable, Logger } from '@nestjs/common';
import { RiskEngineService } from '../services/risk-engine.service';

export interface EvaluatedClause {
  title: string;
  text: string;
  type: string;
  page: number;
  riskScore: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  impact: string;
  recommendation: string;
}

@Injectable()
export class RiskAgent {
  private readonly logger = new Logger(RiskAgent.name);

  constructor(private readonly riskEngine: RiskEngineService) {}

  async evaluateClauses(clauses: any[], contractType: string): Promise<EvaluatedClause[]> {
    this.logger.log(`Evaluating ${clauses.length} clauses through Hybrid Risk Engine...`);
    const evaluatedClauses: EvaluatedClause[] = [];

    // For MVP, evaluate sequentially to avoid rate limits (or use Promise.all for speed)
    for (const clause of clauses) {
      try {
        const riskAnalysis = await this.riskEngine.analyzeClause(clause.text, clause.type, contractType);
        evaluatedClauses.push({
          ...clause,
          ...riskAnalysis
        });
      } catch (error) {
        this.logger.error(`Failed to analyze clause ${clause.title}`, error);
        evaluatedClauses.push({
          ...clause,
          riskScore: 0,
          severity: 'Low',
          reason: 'Analysis failed due to LLM error',
          impact: 'Unknown',
          recommendation: 'Review manually'
        });
      }
    }

    return evaluatedClauses;
  }
}
