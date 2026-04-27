import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  createStoryFromWizardInput as buildStoryFromWizardInput,
  resolveCustomActionInput,
  resolveSelectedChoice,
} from '@/domain/ai';
import type { Scene, Story, WizardStoryInput, WorldState } from '@/domain/story';

type StoryStoreState = {
  hasHydrated: boolean;
  stories: Story[];
  currentStoryId: string | null;
  currentStory: Story | null;
  currentScene: Scene | null;
  sceneHistory: Scene[];
  worldState: WorldState | null;
  isLoading: boolean;
  error: string | null;
  hasStarted: boolean;
};

type StoryStoreActions = {
  markHydrated: (value: boolean) => void;
  createStoryFromWizardInput: (input: WizardStoryInput) => string | null;
  startStory: () => void;
  chooseAction: (choiceId: string) => void;
  submitCustomAction: (actionText: string) => void;
  resetStory: () => void;
  clearAllStories: () => void;
};

export type StoryStore = StoryStoreState & StoryStoreActions;

const initialState: StoryStoreState = {
  hasHydrated: false,
  stories: [],
  currentStoryId: null,
  currentStory: null,
  currentScene: null,
  sceneHistory: [],
  worldState: null,
  isLoading: false,
  error: null,
  hasStarted: false,
};

function applyStoryState(
  story: Story,
): Pick<StoryStoreState, 'currentStoryId' | 'currentStory' | 'currentScene' | 'sceneHistory' | 'worldState'> {
  const currentScene = story.scenes.find((scene) => scene.id === story.currentSceneId) ?? null;

  return {
    currentStoryId: story.id,
    currentStory: story,
    currentScene,
    sceneHistory: story.scenes,
    worldState: story.worldState,
  };
}

function deriveCurrentStory(stories: Story[], currentStoryId: string | null): Story | null {
  if (!currentStoryId) return null;
  return stories.find((story) => story.id === currentStoryId) ?? null;
}

function upsertStory(stories: Story[], story: Story): Story[] {
  const remaining = stories.filter((item) => item.id !== story.id);
  return [story, ...remaining];
}

export const useStoryStore = create<StoryStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      markHydrated: (value) => set({ hasHydrated: value }),

      createStoryFromWizardInput: (input) => {
        set({ isLoading: true, error: null });

        try {
          const { story, firstScene } = buildStoryFromWizardInput(input);

          set({
            stories: upsertStory(get().stories, story),
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
            stories: upsertStory(get().stories, story),
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
            stories: upsertStory(get().stories, story),
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
        set((state) => ({
          ...initialState,
          hasHydrated: state.hasHydrated,
          stories: state.stories,
        }));
      },

      clearAllStories: () => {
        set((state) => ({
          ...initialState,
          hasHydrated: state.hasHydrated,
        }));
      },
    }),
    {
      name: 'storyforge-story-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stories: state.stories,
        currentStoryId: state.currentStoryId,
        sceneHistory: state.sceneHistory,
        worldState: state.worldState,
        hasStarted: state.hasStarted,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const story = deriveCurrentStory(state.stories, state.currentStoryId);
        const currentScene = story?.scenes.find((scene) => scene.id === story.currentSceneId) ?? null;

        state.currentStory = story;
        state.currentScene = currentScene;
        state.sceneHistory = story?.scenes ?? [];
        state.worldState = story?.worldState ?? null;
        state.hasHydrated = true;
      },
    },
  ),
);
