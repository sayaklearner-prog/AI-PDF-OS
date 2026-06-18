import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { EvaluatedClause } from './risk.agent';

export interface ExecutiveSummary {
  contractOverview: string;
  riskFactors: string[];
  financialRisks: string;
  requiredChanges: string[];
  criticalAwareness: string[];
}

@Injectable()
export class SummaryAgent {
  private readonly logger = new Logger(SummaryAgent.name);

  constructor(private readonly aiService: AiService) {}

  async generateSummary(contractType: string, parties: any, dates: any, evaluatedClauses: EvaluatedClause[]): Promise<ExecutiveSummary> {
    this.logger.log('Generating Executive Summary...');

    const highRisks = evaluatedClauses.filter(c => c.severity === 'High' || c.severity === 'Critical');
    
    // Condense the input context so we don't blow up context limits
    const riskSummaryStr = highRisks.map(r => `- ${r.title} (${r.severity}): ${r.impact}`).join('\n');
    
    const prompt = `
      You are an expert legal counsel generating an executive summary for the C-Suite.
      Contract Type: ${contractType}
      Parties: ${JSON.stringify(parties)}
      Dates: ${JSON.stringify(dates)}
      
      Top Risks Detected:
      ${riskSummaryStr || 'No critical risks detected.'}
      
      Generate a structured JSON Executive Summary containing exactly these fields:
      1. contractOverview: A 2-3 sentence high-level summary of the contract's purpose.
      2. riskFactors: An array of strings detailing the biggest risk factors and legal exposures.
      3. financialRisks: A string summarizing payment risks, financial exposure, and financial obligations.
      4. requiredChanges: An array of strings with explicit redlines or changes that need to be made to the contract before signing.
      5. criticalAwareness: An array of strings highlighting critical deadlines, hidden traps, or things the user must be strictly aware of.
    `;

    return await this.aiService.generateJson<ExecutiveSummary>(prompt, { maxTokens: 1000 });
  }
}
