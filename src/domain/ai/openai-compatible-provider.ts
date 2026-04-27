import 'server-only';

import type { Scene, Story, WizardStoryInput } from '@/domain/story';

import type { AIServerConfig } from './ai-config';
import { type SceneGenerationResult, type StoryEngine } from './interfaces';
import { mockStoryEngine } from './mock';
import { validateSceneGenerationResult } from './schemas';

export type ServerStoryEngine = {
  createStory(input: WizardStoryInput): Promise<{ story: Story; firstScene: Scene }>;
  resolveChoice(story: Story, choiceId: string): Promise<{ story: Story; scene: Scene }>;
  resolveCustomAction(story: Story, actionText: string): Promise<{ story: Story; scene: Scene }>;
};

type ProviderMessage = { role: 'system' | 'user'; content: string };

type ProviderErrorCode =
  | 'authorization'
  | 'insufficient_balance'
  | 'model_not_found'
  | 'rate_limit'
  | 'timeout'
  | 'invalid_json'
  | 'schema_validation'
  | 'provider_unavailable'
  | 'unknown_provider_error';

class ProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
  ) {
    super(message);
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function extractJsonString(rawContent: string) {
  const fenced = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = rawContent.indexOf('{');
  const lastBrace = rawContent.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return rawContent.slice(firstBrace, lastBrace + 1).trim();
  }

  return rawContent.trim();
}

function parseSceneGeneration(rawContent: string): SceneGenerationResult {
  try {
    const parsed = JSON.parse(extractJsonString(rawContent));
    return validateSceneGenerationResult(parsed);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('AI validation failed')) {
      throw new ProviderError('schema_validation', 'GenAPI scene JSON failed schema validation.');
    }
    throw new ProviderError('invalid_json', 'GenAPI returned invalid JSON content.');
  }
}

function mapProviderError(status: number): ProviderError {
  if (status === 401 || status === 403) return new ProviderError('authorization', 'GenAPI authorization failed.');
  if (status === 404) return new ProviderError('model_not_found', 'GenAPI model or endpoint was not found.');
  if (status === 429) return new ProviderError('rate_limit', 'GenAPI rate limit reached.');
  if (status === 402) return new ProviderError('insufficient_balance', 'GenAPI account balance is insufficient.');
  if (status >= 500) return new ProviderError('provider_unavailable', 'GenAPI is currently unavailable.');
  return new ProviderError('unknown_provider_error', 'GenAPI request failed.');
}

async function requestChatCompletion(config: AIServerConfig, messages: ProviderMessage[]) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.genApiTimeoutMs);

  try {
    const response = await fetch(`${normalizeBaseUrl(config.genApiBaseUrl)}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.genApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.genApiModel,
        messages,
        temperature: 0.6,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw mapProviderError(response.status);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new ProviderError('unknown_provider_error', 'GenAPI response did not include assistant content.');
    }

    return content;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ProviderError('timeout', 'GenAPI request timed out.');
    }
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new ProviderError('unknown_provider_error', 'GenAPI request failed.');
  } finally {
    clearTimeout(timeout);
  }
}

function buildSceneMessages(story: Story, currentScene: Scene, actionContext: string, strictJsonOnly: boolean): ProviderMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are a cinematic interactive story engine. Output strict JSON only. No markdown. No code fences. ' +
        'Return an object with keys: chapterTitle, sceneTitle, sceneText, choices, imagePrompt, stateChanges, hiddenDirectorNotes (optional). ' +
        'choices must contain 3-5 items with: id, label, intent, riskLevel, requiredCheck(optional), consequenceHint(optional). ' +
        'stateChanges must include: dangerDelta, inventoryAdded, inventoryRemovedIds, relationshipChanges, questUpdates, discoveredFactsAdded.' +
        (strictJsonOnly ? ' Respond with a raw JSON object only. Do not add any extra text.' : ''),
    },
    {
      role: 'user',
      content: JSON.stringify({
        story: {
          id: story.id,
          title: story.title,
          genre: story.genre,
          tone: story.tone,
          visualStyle: story.visualStyle,
        },
        worldState: story.worldState,
        currentScene: {
          chapterTitle: currentScene.chapterTitle,
          sceneTitle: currentScene.sceneTitle,
          sceneText: currentScene.sceneText,
        },
        actionContext,
      }),
    },
  ];
}

function mergeGeneratedScene(story: Story, sceneId: string, generated: SceneGenerationResult) {
  const nextScenes = story.scenes.map((scene) =>
    scene.id === sceneId
      ? {
          ...scene,
          chapterTitle: generated.chapterTitle,
          sceneTitle: generated.sceneTitle,
          sceneText: generated.sceneText,
          choices: generated.choices,
          imagePrompt: generated.imagePrompt,
        }
      : scene,
  );

  const mergedScene = nextScenes.find((scene) => scene.id === sceneId);
  if (!mergedScene) {
    throw new Error('Unable to merge GenAPI scene result.');
  }

  return {
    story: {
      ...story,
      scenes: nextScenes,
    },
    scene: mergedScene,
  };
}

async function generateAndMergeScene(config: AIServerConfig, story: Story, scene: Scene, actionContext: string) {
  try {
    const content = await requestChatCompletion(config, buildSceneMessages(story, scene, actionContext, false));
    const generated = parseSceneGeneration(content);
    return mergeGeneratedScene(story, scene.id, generated);
  } catch (error) {
    if (!(error instanceof ProviderError)) {
      throw new ProviderError('unknown_provider_error', 'GenAPI scene generation failed.');
    }

    if (error.code !== 'invalid_json' && error.code !== 'schema_validation') {
      throw error;
    }

    const retryContent = await requestChatCompletion(config, buildSceneMessages(story, scene, actionContext, true));
    const retryGenerated = parseSceneGeneration(retryContent);
    return mergeGeneratedScene(story, scene.id, retryGenerated);
  }
}

export function wrapMockAsServerEngine(mockEngine: StoryEngine): ServerStoryEngine {
  return {
    async createStory(input) {
      return mockEngine.createStory(input);
    },
    async resolveChoice(story, choiceId) {
      return mockEngine.resolveChoice(story, choiceId);
    },
    async resolveCustomAction(story, actionText) {
      return mockEngine.resolveCustomAction(story, actionText);
    },
  };
}

export function createOpenAICompatibleStoryEngine(config: AIServerConfig): ServerStoryEngine {
  return {
    async createStory(input) {
      const base = mockStoryEngine.createStory(input);
      const merged = await generateAndMergeScene(config, base.story, base.firstScene, 'Story opening scene.');
      return {
        story: merged.story,
        firstScene: merged.scene,
      };
    },

    async resolveChoice(story, choiceId) {
      const base = mockStoryEngine.resolveChoice(story, choiceId);
      return generateAndMergeScene(config, base.story, base.scene, `Selected choice id: ${choiceId}`);
    },

    async resolveCustomAction(story, actionText) {
      const base = mockStoryEngine.resolveCustomAction(story, actionText);
      return generateAndMergeScene(config, base.story, base.scene, `Custom action: ${actionText}`);
    },
  };
}
