export const STORY_GENRES = [
  'Dark Fantasy',
  'Mystic Detective',
  'Space Odyssey',
  'Horror',
  'Romance',
  'Cyberpunk',
  'Post-apocalyptic',
  'Urban Fantasy',
] as const;

export const STORY_TONES = ['Cinematic', 'Dark', 'Cozy', 'Epic', 'Mysterious', 'Brutal', 'Fairy-tale', 'Anime-inspired'] as const;

export const VISUAL_STYLES = [
  'Cinematic realism',
  'Premium fantasy illustration',
  'Dark gothic',
  'Anime fantasy',
  'Watercolor dream',
  'Retro sci-fi',
] as const;

export const STORY_DIFFICULTIES = ['Easy', 'Normal', 'Dangerous', 'Hardcore'] as const;
export const STORY_LENGTHS = ['Short adventure', 'Medium story', 'Long campaign'] as const;

export type StoryGenre = (typeof STORY_GENRES)[number];
export type StoryTone = (typeof STORY_TONES)[number];
export type VisualStyle = (typeof VISUAL_STYLES)[number];
export type StoryDifficulty = (typeof STORY_DIFFICULTIES)[number];
export type StoryLength = (typeof STORY_LENGTHS)[number];

export type RiskLevel = 'low' | 'medium' | 'high';

export type ChoiceIntent =
  | 'explore'
  | 'investigate'
  | 'social'
  | 'combat'
  | 'stealth'
  | 'resource'
  | 'defensive'
  | 'creative';

export interface Choice {
  id: string;
  label: string;
  intent: ChoiceIntent;
  riskLevel: RiskLevel;
  requiredCheck?: string;
  consequenceHint?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic';
}

export interface NpcRelationship {
  npcId: string;
  npcName: string;
  trust: number;
  tension: number;
  note: string;
}

export type QuestStatus = 'active' | 'completed' | 'failed';

export interface Quest {
  id: string;
  title: string;
  summary: string;
  status: QuestStatus;
  progress: number;
}

export interface WorldState {
  dangerLevel: number;
  inventory: InventoryItem[];
  relationships: NpcRelationship[];
  quests: Quest[];
  discoveredFacts: string[];
}

export interface ImageAsset {
  id: string;
  prompt: string;
  url?: string;
  placeholder: string;
}

export interface SceneStateChanges {
  dangerDelta: number;
  inventoryAdded: InventoryItem[];
  inventoryRemovedIds: string[];
  relationshipChanges: Array<{ npcId: string; trustDelta: number; tensionDelta: number; note: string }>;
  questUpdates: Array<{ questId: string; status?: QuestStatus; progressDelta?: number; note: string }>;
  discoveredFactsAdded: string[];
}

export interface Scene {
  id: string;
  storyId: string;
  chapterNumber: number;
  chapterTitle: string;
  sceneTitle: string;
  sceneText: string;
  choices: Choice[];
  imagePrompt: string;
  imageUrl?: string;
  imagePlaceholder: string;
  createdAt: string;
  stateChanges: SceneStateChanges;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  strength: string;
  weakness: string;
  secret: string;
  goal: string;
  startingItem?: string;
}

export interface Story {
  id: string;
  title: string;
  synopsis: string;
  protagonist: Character;
  genre: StoryGenre;
  tone: StoryTone;
  visualStyle: VisualStyle;
  difficulty: StoryDifficulty;
  length: StoryLength;
  createdAt: string;
  updatedAt: string;
  worldState: WorldState;
  scenes: Scene[];
  currentSceneId?: string;
}

export interface WizardStoryInput {
  idea: string;
  genre: StoryGenre;
  tone: StoryTone;
  visualStyle: VisualStyle;
  difficulty: StoryDifficulty;
  length: StoryLength;
  characterMode: 'generate' | 'manual';
  character?: Partial<Character>;
}
