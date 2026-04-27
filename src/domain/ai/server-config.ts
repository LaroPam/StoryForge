import 'server-only';

const allowedProviders = ['mock', 'openai', 'fallback'] as const;

export type AIProvider = (typeof allowedProviders)[number];

export type AIServerConfig = {
  provider: AIProvider;
  model: string;
  openAIApiKey?: string;
};

const DEFAULT_AI_MODEL = 'gpt-4.1-mini';

function resolveProvider(rawProvider: string | undefined): AIProvider {
  if (!rawProvider) return 'mock';
  if ((allowedProviders as readonly string[]).includes(rawProvider)) return rawProvider as AIProvider;
  return 'mock';
}

export function getAIServerConfig(): AIServerConfig {
  const provider = resolveProvider(process.env.AI_PROVIDER);
  const model = process.env.AI_MODEL?.trim() || DEFAULT_AI_MODEL;
  const openAIApiKey = process.env.OPENAI_API_KEY?.trim();

  if (provider === 'openai' && !openAIApiKey) {
    throw new Error('AI_PROVIDER is set to "openai" but OPENAI_API_KEY is missing. Set OPENAI_API_KEY in .env.local.');
  }

  return {
    provider,
    model,
    openAIApiKey,
  };
}
