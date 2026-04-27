import type { StoryEngine } from './interfaces';
import { mockStoryEngine } from './mock';

export function getStoryEngine(): StoryEngine {
  return mockStoryEngine;
}
