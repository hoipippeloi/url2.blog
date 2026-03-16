import { LLMGatewayClient } from './client';

export const llmClient = new LLMGatewayClient({
  baseUrl: 'https://hoi-llm-gateway.up.railway.app',
  model: 'unsloth/Qwen3.5-2B-GGUF',
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 30000, // 30 seconds
});
