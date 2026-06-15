import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai.service';

export interface RiskAnalysisResult {
  riskScore: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  impact: string;
  recommendation: string;
}

@Injectable()
export class RiskEngineService {
  private readonly logger = new Logger(RiskEngineService.name);

  constructor(private readonly aiService: AiService) {}

  // Hybrid engine: Rules first, then LLM for context
  async analyzeClause(clauseText: string, clauseType: string, contractType: string): Promise<RiskAnalysisResult> {
    let ruleScore = 0;
    let ruleReasons: string[] = [];

    const lowerText = clauseText.toLowerCase();

    // Example Deterministic Rules
    if (lowerText.includes('unlimited liability')) {
      ruleScore += 40;
      ruleReasons.push('Unlimited Liability clause detected.');
    }
    if (lowerText.includes('auto renewal') || lowerText.includes('automatic renewal')) {
      ruleScore += 20;
      ruleReasons.push('Auto Renewal clause detected.');
    }
    if (lowerText.includes('terminate at any time') || lowerText.includes('sole discretion to terminate')) {
      ruleScore += 25;
      ruleReasons.push('One-Sided Termination clause detected.');
    }

    // Pass rules context to LLM for final evaluation
    const prompt = `
      Analyze the following legal clause from a ${contractType} contract.
      Clause Type: ${clauseType}
      Clause Text: ${clauseText}
      
      Our deterministic rule engine detected the following risks (Score: ${ruleScore}):
      ${ruleReasons.length > 0 ? ruleReasons.join(', ') : 'No hardcoded rule triggers.'}
      
      Provide a comprehensive risk assessment in JSON format:
      1. riskScore: A number from 0 to 100 representing the absolute risk of this clause (consider the rule score, but adjust based on nuance).
      2. severity: "Low", "Medium", "High", or "Critical". (Score > 75 = Critical, > 50 = High, > 25 = Medium, else Low).
      3. reason: Detailed explanation of why it scored this way.
      4. impact: The business/legal impact of this clause.
      5. recommendation: How to handle or negotiate this risk.
    `;

    return await this.aiService.generateJson<RiskAnalysisResult>(prompt);
  }
}
