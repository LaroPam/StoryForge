import { create } from 'zustand';

import {
  createStoryFromWizardInput as buildStoryFromWizardInput,
  resolveCustomActionInput,
  resolveSelectedChoice,
} from '@/domain/ai';
import type { Scene, Story, WizardStoryInput, WorldState } from '@/domain/story';

type StoryStoreState = {
  currentStory: Story | null;
  currentScene: Scene | null;
  sceneHistory: Scene[];
  worldState: WorldState | null;
  isLoading: boolean;
  error: string | null;
  hasStarted: boolean;
};

type StoryStoreActions = {
  createStoryFromWizardInput: (input: WizardStoryInput) => string | null;
  startStory: () => void;
  chooseAction: (choiceId: string) => void;
  submitCustomAction: (actionText: string) => void;
  resetStory: () => void;
};

export type StoryStore = StoryStoreState & StoryStoreActions;

const initialState: StoryStoreState = {
  currentStory: null,
  currentScene: null,
  sceneHistory: [],
  worldState: null,
  isLoading: false,
  error: null,
  hasStarted: false,
};

function applyStoryState(story: Story): Pick<StoryStoreState, 'currentStory' | 'currentScene' | 'sceneHistory' | 'worldState'> {
  const currentScene = story.scenes.find((scene) => scene.id === story.currentSceneId) ?? null;

  return {
    currentStory: story,
    currentScene,
    sceneHistory: story.scenes,
    worldState: story.worldState,
  };
}

export const useStoryStore = create<StoryStore>((set, get) => ({
  ...initialState,

  createStoryFromWizardInput: (input) => {
    set({ isLoading: true, error: null });

    try {
      const { story, firstScene } = buildStoryFromWizardInput(input);

      set({
        ...applyStoryState(story),
        currentScene: firstScene,
        sceneHistory: [firstScene],
        hasStarted: false,
        isLoading: false,
        error: null,
      });
      return story.id;
    } catch {
      set({ isLoading: false, error: 'Unable to create story from wizard input.' });
      return null;
    }
  },

  startStory: () => {
    const { currentStory } = get();

    if (!currentStory) {
      set({ error: 'Create a story before starting the adventure.' });
      return;
    }

    set({ hasStarted: true, error: null });
  },

  chooseAction: (choiceId) => {
    const { currentStory, hasStarted } = get();

    if (!currentStory || !hasStarted) {
      set({ error: 'Start the story before making a choice.' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { story, scene } = resolveSelectedChoice(currentStory, choiceId);

      set({
        ...applyStoryState(story),
        currentScene: scene,
        sceneHistory: story.scenes,
        isLoading: false,
        error: null,
      });
    } catch {
      set({ isLoading: false, error: 'Unable to resolve selected action.' });
    }
  },

  submitCustomAction: (actionText) => {
    const { currentStory, hasStarted } = get();

    if (!currentStory || !hasStarted) {
      set({ error: 'Start the story before submitting a custom action.' });
      return;
    }

    const normalized = actionText.trim();
    if (!normalized) {
      set({ error: 'Custom action cannot be empty.' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { story, scene } = resolveCustomActionInput(currentStory, normalized);

      set({
        ...applyStoryState(story),
        currentScene: scene,
        sceneHistory: story.scenes,
        isLoading: false,
        error: null,
      });
    } catch {
      set({ isLoading: false, error: 'Unable to resolve custom action.' });
    }
  },

  resetStory: () => {
    set({ ...initialState });
  },
}));
