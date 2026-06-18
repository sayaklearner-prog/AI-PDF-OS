import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { EvaluatedClause } from './risk.agent';

export interface NegotiationResult {
  proposedRewrite: string;
  explanation: string;
}

@Injectable()
export class NegotiationAgent {
  private readonly logger = new Logger(NegotiationAgent.name);

  constructor(private readonly aiService: AiService) {}

  async generateRewrite(clause: EvaluatedClause, contractType: string, parties: any): Promise<NegotiationResult> {
    this.logger.log(`Generating rewrite suggestion for clause: ${clause.title}`);

    const prompt = `
      You are an expert legal negotiator representing one of the parties in a ${contractType}.
      The following clause was flagged with a risk severity of ${clause.severity}.
      
      Clause Title: ${clause.title || 'Untitled'}
      Original Text: ${clause.text}
      Risk Reason: ${clause.reason}
      Business Impact: ${clause.impact}
      
      Your task is to rewrite the clause to be more balanced, fair, and lower the risk.
      
      Provide a structured JSON response containing:
      1. proposedRewrite: The actual legal text of the new suggested clause.
      2. explanation: A brief explanation of why this rewrite protects your client better while remaining acceptable to the other party.
    `;

    return await this.aiService.generateJson<NegotiationResult>(prompt, { maxTokens: 1000 });
  }
}
