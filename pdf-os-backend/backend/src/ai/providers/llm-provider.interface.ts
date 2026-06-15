export interface LlmQueryOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export interface ILlmProvider {
  /**
   * Generates a text response from the provided prompt.
   */
  generateText(prompt: string, options?: LlmQueryOptions): Promise<string>;

  /**
   * Generates structured JSON from the provided prompt.
   */
  generateJson<T>(prompt: string, options?: LlmQueryOptions): Promise<T>;

  /**
   * Returns the provider name.
   */
  getProviderName(): string;
}
