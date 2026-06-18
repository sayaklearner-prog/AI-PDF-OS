import { Injectable, Logger } from '@nestjs/common';
import { ILlmProvider, LlmQueryOptions } from './llm-provider.interface';

@Injectable()
export class AiMlProvider implements ILlmProvider {
  private readonly logger = new Logger(AiMlProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.aimlapi.com/v1'; // Standard OpenAI compatible endpoint for AI/ML API

  constructor() {
    this.apiKey = process.env.AIML_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('AIML_API_KEY is not set. API calls will fail.');
    }
  }

  getProviderName(): string {
    return 'AI/ML API';
  }

  async generateText(prompt: string, options?: LlmQueryOptions): Promise<string> {
    return this.callApi(prompt, options);
  }

  async generateJson<T>(prompt: string, options?: LlmQueryOptions): Promise<T> {
    const responseText = await this.callApi(prompt, { ...options, responseFormat: 'json_object' });
    try {
      return JSON.parse(responseText) as T;
    } catch (error) {
      this.logger.error('Failed to parse JSON response from AI/ML API', error);
      throw new Error('Invalid JSON format returned from LLM');
    }
  }

  private async callApi(prompt: string, options?: LlmQueryOptions): Promise<string> {
    const payload = {
      model: 'gpt-4o', // Default strong model, can be overridden
      messages: [
        { role: 'system', content: 'You are a highly intelligent legal contract analysis AI.' },
        { role: 'user', content: prompt }
      ],
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 2048,
      ...(options?.responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {})
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      this.logger.error(`AI/ML API request failed: ${response.status} - ${errorData}`);
      throw new Error(`AI/ML API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
