import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { EvaluatedClause } from './risk.agent';

export interface ExecutiveSummary {
  contractOverview: string;
  topRisks: string[];
  financialObligations: string;
  recommendations: string[];
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
      
      Generate a structured JSON Executive Summary containing:
      1. contractOverview: A 2-3 sentence high-level summary of the contract's purpose.
      2. topRisks: An array of strings detailing the biggest concerns.
      3. financialObligations: A string summarizing payment terms or financial exposure.
      4. recommendations: An array of strings with actionable next steps.
    `;

    return await this.aiService.generateJson<ExecutiveSummary>(prompt, { maxTokens: 1000 });
  }
}
