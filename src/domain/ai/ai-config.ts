import 'server-only';

const allowedProviders = ['mock', 'genapi'] as const;

export type AIProvider = (typeof allowedProviders)[number];

export type AIServerConfig = {
  provider: AIProvider;
  genApiKey?: string;
  genApiBaseUrl: string;
  genApiModel: string;
  genApiTimeoutMs: number;
  fallbackToMock: boolean;
};

const DEFAULT_GENAPI_BASE_URL = 'https://proxy.gen-api.ru/v1';
const DEFAULT_GENAPI_MODEL = 'gpt-5-4';
const DEFAULT_GENAPI_TIMEOUT_MS = 60_000;

function resolveProvider(rawProvider: string | undefined): AIProvider {
  if (!rawProvider) return 'mock';
  if ((allowedProviders as readonly string[]).includes(rawProvider)) return rawProvider as AIProvider;
  return 'mock';
}

function resolveTimeout(rawTimeout: string | undefined): number {
  if (!rawTimeout) return DEFAULT_GENAPI_TIMEOUT_MS;

  const parsed = Number.parseInt(rawTimeout, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_GENAPI_TIMEOUT_MS;

  return parsed;
}

function resolveBoolean(raw: string | undefined, defaultValue: boolean): boolean {
  if (!raw) return defaultValue;
  return raw.toLowerCase() === 'true';
}

export function getAIServerConfig(): AIServerConfig {
  const provider = resolveProvider(process.env.AI_PROVIDER);
  const genApiKey = process.env.GENAPI_API_KEY?.trim();
  const genApiBaseUrl = process.env.GENAPI_BASE_URL?.trim() || DEFAULT_GENAPI_BASE_URL;
  const genApiModel = process.env.GENAPI_MODEL?.trim() || DEFAULT_GENAPI_MODEL;
  const genApiTimeoutMs = resolveTimeout(process.env.GENAPI_TIMEOUT_MS);
  const fallbackToMock = resolveBoolean(process.env.GENAPI_FALLBACK_TO_MOCK, true);

  if (provider === 'genapi' && !genApiKey) {
    throw new Error('AI_PROVIDER is set to \"genapi\" but GENAPI_API_KEY is missing. Set GENAPI_API_KEY in .env.local.');
  }

  return {
    provider,
    genApiKey,
    genApiBaseUrl,
    genApiModel,
    genApiTimeoutMs,
    fallbackToMock,
  };
}
