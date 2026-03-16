export interface LLMGatewayConfig {
  baseUrl: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface BlogGenerationOptions {
  url: string;
  title?: string;
  blogReason?: string;
  tone?: string;
  format?: string;
  tags?: string[];
  category?: string;
  additionalInstructions?: string;
}

export class LLMGatewayClient {
  private config: LLMGatewayConfig;

  constructor(config: LLMGatewayConfig) {
    this.config = config;
  }

  async generateBlogPost(options: BlogGenerationOptions): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(options);
    const userPrompt = this.buildUserPrompt(options);

    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.config.maxTokens || 2048,
        temperature: this.config.temperature || 0.7,
      }),
      signal: AbortSignal.timeout(this.config.timeout || 30000),
    });

    if (!response.ok) {
      throw new Error(`LLM Gateway error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private buildSystemPrompt(options: BlogGenerationOptions): string {
    return `You are a professional blog writer. Generate well-structured blog posts with YAML frontmatter.

Required frontmatter fields:
- title: Blog post title
- tags: Array of relevant tags
- category: Blog category
- tone: Writing tone (${options.tone || 'Professional'})
- format: Content format (${options.format || 'Tutorial'})

Write engaging, informative content that provides value to developers.`;
  }

  private buildUserPrompt(options: BlogGenerationOptions): string {
    let prompt = `Write a blog post about this URL: ${options.url}`;
    
    if (options.title) {
      prompt += `\n\nSuggested title: ${options.title}`;
    }
    
    if (options.blogReason) {
      prompt += `\n\nReason for writing: ${options.blogReason}`;
    }
    
    if (options.tags && options.tags.length > 0) {
      prompt += `\n\nTags: ${options.tags.join(', ')}`;
    }
    
    if (options.category) {
      prompt += `\n\nCategory: ${options.category}`;
    }
    
    if (options.additionalInstructions) {
      prompt += `\n\nAdditional instructions: ${options.additionalInstructions}`;
    }
    
    return prompt;
  }
}
