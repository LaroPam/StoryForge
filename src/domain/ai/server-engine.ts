import 'server-only';

import type { Story, WizardStoryInput } from '@/domain/story';

import { mockStoryEngine } from './mock';
import { createOpenAICompatibleStoryEngine, type ServerStoryEngine, wrapMockAsServerEngine } from './openai-compatible-provider';
import { getAIServerConfig } from './ai-config';

const mockServerEngine = wrapMockAsServerEngine(mockStoryEngine);

function createFallbackServerEngine(primary: ServerStoryEngine): ServerStoryEngine {
  return {
    async createStory(input: WizardStoryInput) {
      try {
        return await primary.createStory(input);
      } catch {
        return mockServerEngine.createStory(input);
      }
    },
    async resolveChoice(story: Story, choiceId: string) {
      try {
        return await primary.resolveChoice(story, choiceId);
      } catch {
        return mockServerEngine.resolveChoice(story, choiceId);
      }
    },
    async resolveCustomAction(story: Story, actionText: string) {
      try {
        return await primary.resolveCustomAction(story, actionText);
      } catch {
        return mockServerEngine.resolveCustomAction(story, actionText);
      }
    },
  };
}

export function getServerStoryEngine(): ServerStoryEngine {
  const config = getAIServerConfig();
  const { provider } = config;

  if (provider === 'mock') {
    return mockServerEngine;
  }

  const genApiEngine = createOpenAICompatibleStoryEngine(config);
  return config.fallbackToMock ? createFallbackServerEngine(genApiEngine) : genApiEngine;
}
