import 'server-only';

import type { StoryEngine } from './interfaces';
import { mockStoryEngine } from './mock';
import { getAIServerConfig } from './ai-config';

export function getServerStoryEngine(): StoryEngine {
  const { provider } = getAIServerConfig();

  if (provider === 'mock') {
    return mockStoryEngine;
  }

  // Phase 2 keeps runtime behavior mock-backed while introducing a server boundary.
  // Real GenAPI-backed engine wiring will be added in the next phase.
  return mockStoryEngine;
}
