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
  } catch {
    throw new Error('GenAPI returned invalid scene JSON.');
  }
}

function mapProviderError(status: number) {
  if (status === 401 || status === 403) return 'GenAPI authorization failed.';
  if (status === 404) return 'GenAPI model or endpoint was not found.';
  if (status === 429) return 'GenAPI rate limit reached.';
  if (status === 402) return 'GenAPI account balance is insufficient.';
  if (status >= 500) return 'GenAPI is currently unavailable.';
  return 'GenAPI request failed.';
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
      throw new Error(mapProviderError(response.status));
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('GenAPI response did not include assistant content.');
    }

    return content;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('GenAPI request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function buildSceneMessages(story: Story, currentScene: Scene, actionContext: string): ProviderMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are a cinematic interactive story engine. Output strict JSON only. No markdown. No code fences. ' +
        'Return an object with keys: chapterTitle, sceneTitle, sceneText, choices, imagePrompt, stateChanges, hiddenDirectorNotes (optional). ' +
        'choices must contain 3-5 items with: id, label, intent, riskLevel, requiredCheck(optional), consequenceHint(optional). ' +
        'stateChanges must include: dangerDelta, inventoryAdded, inventoryRemovedIds, relationshipChanges, questUpdates, discoveredFactsAdded.',
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
  const content = await requestChatCompletion(config, buildSceneMessages(story, scene, actionContext));
  const generated = parseSceneGeneration(content);
  return mergeGeneratedScene(story, scene.id, generated);
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
