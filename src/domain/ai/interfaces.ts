import type {
  Choice,
  ImageAsset,
  Scene,
  SceneStateChanges,
  Story,
  WizardStoryInput,
  WorldState,
} from '@/domain/story';

export interface StorySeedResult {
  story: Story;
  openingSceneDirection: string;
  mainConflict: string;
}

export interface StorySeedGenerator {
  generate(input: WizardStoryInput): StorySeedResult;
}

export interface SceneGenerationInput {
  story: Story;
  turnNumber: number;
  actionSummary: string;
}

export interface SceneGenerationResult {
  chapterTitle: string;
  sceneTitle: string;
  sceneText: string;
  choices: Choice[];
  imagePrompt: string;
  stateChanges: SceneStateChanges;
  hiddenDirectorNotes?: string;
}

export interface SceneGenerator {
  generate(input: SceneGenerationInput): SceneGenerationResult;
}

export interface ActionResolutionResult {
  actionSummary: string;
  dangerDelta: number;
  relationshipHint: string;
  fact: string;
}

export interface ActionResolver {
  resolveChoice(scene: Scene, choiceId: string): ActionResolutionResult;
  resolveCustomAction(scene: Scene, customAction: string): ActionResolutionResult;
}

export interface WorldStateUpdater {
  apply(current: WorldState, updates: SceneStateChanges): WorldState;
}

export interface ImagePromptGenerator {
  generate(story: Story, sceneSummary: string): string;
}

export interface ImageGenerator {
  generate(prompt: string): ImageAsset;
}

export interface StoryEngine {
  createStory(input: WizardStoryInput): { story: Story; firstScene: Scene };
  resolveChoice(story: Story, choiceId: string): { story: Story; scene: Scene };
  resolveCustomAction(story: Story, actionText: string): { story: Story; scene: Scene };
}
