import type {
  Character,
  Choice,
  ImageAsset,
  InventoryItem,
  NpcRelationship,
  Quest,
  Scene,
  SceneStateChanges,
  Story,
  WizardStoryInput,
  WorldState,
} from '@/domain/story';

import type {
  ActionResolutionResult,
  ActionResolver,
  ImageGenerator,
  ImagePromptGenerator,
  SceneGenerationInput,
  SceneGenerationResult,
  SceneGenerator,
  StoryEngine,
  StorySeedGenerator,
  StorySeedResult,
  WorldStateUpdater,
} from './interfaces';
import {
  validateActionResolutionResult,
  validateImagePromptResult,
  validateSceneGenerationResult,
  validateSceneStateChanges,
} from './schemas';

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function fallbackCharacter(input: WizardStoryInput): Character {
  const roleByGenre: Record<WizardStoryInput['genre'], string> = {
    'Dark Fantasy': 'Rune-bearer exile',
    'Mystic Detective': 'Occult investigator',
    'Space Odyssey': 'Frontier navigator',
    Horror: 'Reluctant survivor',
    Romance: 'Wanderer with a closed heart',
    Cyberpunk: 'Memory-smuggler',
    'Post-apocalyptic': 'Ashlands scout',
    'Urban Fantasy': 'Night-bound mediator',
  };

  return {
    id: uid('character'),
    name: 'Ari Vale',
    role: roleByGenre[input.genre],
    strength: 'Unshakable intuition',
    weakness: 'Haunted by one impossible choice',
    secret: 'Knows a truth that could break the city',
    goal: 'Protect the last fragment of hope',
    startingItem: 'Weathered compass',
  };
}

function initialWorldState(character: Character): WorldState {
  const initialItem: InventoryItem | null = character.startingItem
    ? {
        id: uid('item'),
        name: character.startingItem,
        description: 'A personal artifact that carries memory and meaning.',
        rarity: 'common',
      }
    : null;

  const initialRelationship: NpcRelationship = {
    npcId: uid('npc'),
    npcName: 'Mira Thorn',
    trust: 55,
    tension: 25,
    note: 'Knows more than she says.',
  };

  const initialQuest: Quest = {
    id: uid('quest'),
    title: 'Follow the first omen',
    summary: 'Track the source of the sign hidden in your opening memory.',
    status: 'active',
    progress: 10,
  };

  return {
    dangerLevel: 30,
    inventory: initialItem ? [initialItem] : [],
    relationships: [initialRelationship],
    quests: [initialQuest],
    discoveredFacts: ['A repeating symbol appears near major turning points.'],
  };
}

function defaultStateChanges(): SceneStateChanges {
  return {
    dangerDelta: 0,
    inventoryAdded: [],
    inventoryRemovedIds: [],
    relationshipChanges: [],
    questUpdates: [],
    discoveredFactsAdded: [],
  };
}

function makeChoices(turnNumber: number): Choice[] {
  return [
    {
      id: uid('choice'),
      label: 'Investigate the nearest clue',
      intent: 'investigate',
      riskLevel: turnNumber % 2 === 0 ? 'medium' : 'low',
      consequenceHint: 'May reveal hidden motives.',
    },
    {
      id: uid('choice'),
      label: 'Negotiate with a suspicious ally',
      intent: 'social',
      riskLevel: 'low',
      requiredCheck: 'Willpower',
      consequenceHint: 'Can improve trust or expose your weakness.',
    },
    {
      id: uid('choice'),
      label: 'Take a risky direct action',
      intent: 'combat',
      riskLevel: 'high',
      consequenceHint: 'Fast progress at a potential cost.',
    },
  ];
}

export const mockStorySeedGenerator: StorySeedGenerator = {
  generate(input): StorySeedResult {
    const protagonist: Character =
      input.characterMode === 'manual' && input.character?.name
        ? {
            id: uid('character'),
            name: input.character.name,
            role: input.character.role ?? 'Wanderer',
            strength: input.character.strength ?? 'Adaptable',
            weakness: input.character.weakness ?? 'Doubt under pressure',
            secret: input.character.secret ?? 'Carries an unspoken truth',
            goal: input.character.goal ?? 'Find meaning in the unknown',
            startingItem: input.character.startingItem,
          }
        : fallbackCharacter(input);

    const story: Story = {
      id: uid('story'),
      title: `${input.genre}: The First Echo`,
      synopsis: `In a ${input.tone.toLowerCase()} ${input.genre.toLowerCase()} world, ${protagonist.name} follows a dangerous lead: ${input.idea}.`,
      protagonist,
      genre: input.genre,
      tone: input.tone,
      visualStyle: input.visualStyle,
      difficulty: input.difficulty,
      length: input.length,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      worldState: initialWorldState(protagonist),
      scenes: [],
    };

    return {
      story,
      mainConflict: 'A hidden force is reshaping the world through memory and fear.',
      openingSceneDirection: `Open with atmospheric tension around: ${input.idea}`,
    };
  },
};

export const mockActionResolver: ActionResolver = {
  resolveChoice(scene, choiceId): ActionResolutionResult {
    const selected = scene.choices.find((choice) => choice.id === choiceId);

    if (!selected) {
      return validateActionResolutionResult({
        actionSummary: 'The protagonist hesitates, uncertain which path to take.',
        dangerDelta: 1,
        relationshipHint: 'Uncertainty frustrates allies.',
        fact: 'Hesitation can be as costly as a wrong decision.',
      });
    }

    const dangerByRisk = { low: 0, medium: 3, high: 6 } as const;

    return validateActionResolutionResult({
      actionSummary: `The protagonist chooses to ${selected.label.toLowerCase()}.`,
      dangerDelta: dangerByRisk[selected.riskLevel],
      relationshipHint:
        selected.intent === 'social'
          ? 'A fragile bond may strengthen.'
          : selected.intent === 'combat'
            ? 'Bold action inspires some and alarms others.'
            : 'Companions watch closely, waiting for proof.',
      fact: `Intent recorded: ${selected.intent}. Consequences ripple outward.`,
    });
  },

  resolveCustomAction(_scene, customAction): ActionResolutionResult {
    const normalized = customAction.trim();

    if (normalized.length < 8) {
      return validateActionResolutionResult({
        actionSummary: 'The attempt is too vague to execute cleanly.',
        dangerDelta: 2,
        relationshipHint: 'Your allies ask for a clearer plan.',
        fact: 'Precision matters in volatile situations.',
      });
    }

    const godMode = /instantly|immortal|destroy all|god/i.test(normalized);

    if (godMode) {
      return validateActionResolutionResult({
        actionSummary:
          'The protagonist attempts impossible power. The move partially fails, drawing attention and escalating danger.',
        dangerDelta: 8,
        relationshipHint: 'Companions fear what you almost unleashed.',
        fact: 'Impossible actions are converted into costly attempts.',
      });
    }

    return validateActionResolutionResult({
      actionSummary: `Custom action attempted: ${normalized}`,
      dangerDelta: 3,
      relationshipHint: 'The group reacts to your initiative with cautious respect.',
      fact: 'Your action altered the momentum of the scene.',
    });
  },
};

export const mockImagePromptGenerator: ImagePromptGenerator = {
  generate(story, sceneSummary): string {
    const prompt = `${story.visualStyle}, ${story.tone.toLowerCase()} mood, ${story.genre.toLowerCase()} setting, protagonist ${story.protagonist.name}, cinematic composition, dramatic lighting, scene: ${sceneSummary}`;
    return validateImagePromptResult(prompt);
  },
};

export const mockImageGenerator: ImageGenerator = {
  generate(prompt): ImageAsset {
    return {
      id: uid('image'),
      prompt,
      placeholder: '/images/placeholders/scene-atmospheric-placeholder.jpg',
    };
  },
};

export const mockSceneGenerator: SceneGenerator = {
  generate(input: SceneGenerationInput): SceneGenerationResult {
    const chapterNumber = Math.max(1, Math.ceil(input.turnNumber / 3));
    const chapterTitle = `Chapter ${chapterNumber}: The Turning Veil`;
    const sceneTitle = `Scene ${input.turnNumber}: Consequences in Motion`;

    const choices = makeChoices(input.turnNumber);

    const actionDanger = input.actionResult?.dangerDelta ?? 0;

    const stateChanges: SceneStateChanges = validateSceneStateChanges({
      ...defaultStateChanges(),
      dangerDelta:
        actionDanger + (input.actionSummary.includes('impossible') ? 4 : input.actionSummary.includes('hesitates') ? 1 : 2),
      discoveredFactsAdded: [
        `Turn ${input.turnNumber}: ${input.actionSummary}`,
        ...(input.actionResult?.fact ? [input.actionResult.fact] : []),
      ],
      relationshipChanges: [
        {
          npcId: input.story.worldState.relationships[0]?.npcId ?? uid('npc'),
          trustDelta: input.actionSummary.includes('negotiate') ? 4 : 1,
          tensionDelta: input.actionSummary.includes('risky') ? 4 : actionDanger > 4 ? 3 : 1,
          note: input.actionResult?.relationshipHint ?? 'The latest decision changed interpersonal balance.',
        },
      ],
      questUpdates: [
        {
          questId: input.story.worldState.quests[0]?.id ?? uid('quest'),
          progressDelta: 15,
          note: 'The active quest advanced through this scene.',
        },
      ],
      inventoryAdded:
        input.turnNumber % 2 === 0
          ? [
              {
                id: uid('item'),
                name: 'Cipher Fragment',
                description: 'A clue-bearing object tied to the current mystery.',
                rarity: 'rare',
              },
            ]
          : [],
    });

    return validateSceneGenerationResult({
      chapterTitle,
      sceneTitle,
      sceneText:
        `${input.actionSummary} ${input.actionResult?.relationshipHint ?? ''}`.trim() +
        ' The atmosphere shifts as the world answers in kind. ' +
        `Danger hums at the edge of every choice, and unresolved mysteries grow sharper.`,
      choices,
      imagePrompt: mockImagePromptGenerator.generate(input.story, `${sceneTitle} in ${chapterTitle}`),
      stateChanges,
      hiddenDirectorNotes: 'Keep pressure rising while preserving player agency.',
    });
  },
};

export const mockWorldStateUpdater: WorldStateUpdater = {
  apply(current: WorldState, updates: SceneStateChanges): WorldState {
    const safeUpdates = validateSceneStateChanges(updates);
    const relationshipById = new Map(current.relationships.map((rel) => [rel.npcId, rel]));

    for (const change of safeUpdates.relationshipChanges) {
      const existing = relationshipById.get(change.npcId);
      if (!existing) continue;

      relationshipById.set(change.npcId, {
        ...existing,
        trust: clamp(existing.trust + change.trustDelta, 0, 100),
        tension: clamp(existing.tension + change.tensionDelta, 0, 100),
        note: change.note,
      });
    }

    const questById = new Map(current.quests.map((quest) => [quest.id, quest]));

    for (const change of safeUpdates.questUpdates) {
      const existing = questById.get(change.questId);
      if (!existing) continue;

      const nextProgress = clamp(existing.progress + (change.progressDelta ?? 0), 0, 100);
      questById.set(change.questId, {
        ...existing,
        status: change.status ?? (nextProgress >= 100 ? 'completed' : existing.status),
        progress: nextProgress,
      });
    }

    return {
      dangerLevel: clamp(current.dangerLevel + safeUpdates.dangerDelta, 0, 100),
      inventory: [
        ...current.inventory.filter((item) => !safeUpdates.inventoryRemovedIds.includes(item.id)),
        ...safeUpdates.inventoryAdded,
      ],
      relationships: Array.from(relationshipById.values()),
      quests: Array.from(questById.values()),
      discoveredFacts: Array.from(new Set([...current.discoveredFacts, ...safeUpdates.discoveredFactsAdded])),
    };
  },
};

function makeSceneFromGeneration(story: Story, generation: SceneGenerationResult, chapterNumber: number): Scene {
  const image = mockImageGenerator.generate(generation.imagePrompt);

  return {
    id: uid('scene'),
    storyId: story.id,
    chapterNumber,
    chapterTitle: generation.chapterTitle,
    sceneTitle: generation.sceneTitle,
    sceneText: generation.sceneText,
    choices: generation.choices,
    imagePrompt: generation.imagePrompt,
    imageUrl: image.url,
    imagePlaceholder: image.placeholder,
    createdAt: nowIso(),
    stateChanges: generation.stateChanges,
  };
}

function appendScene(story: Story, scene: Scene): Story {
  const nextWorldState = mockWorldStateUpdater.apply(story.worldState, scene.stateChanges);

  return {
    ...story,
    scenes: [...story.scenes, scene],
    currentSceneId: scene.id,
    worldState: nextWorldState,
    updatedAt: nowIso(),
  };
}

function latestScene(story: Story): Scene {
  const found = story.scenes.find((scene) => scene.id === story.currentSceneId);
  if (!found) {
    throw new Error('No current scene found. Create the story and first scene before resolving actions.');
  }
  return found;
}

function generateNextScene(story: Story, actionSummary: string): { story: Story; scene: Scene } {
  const turnNumber = story.scenes.length + 1;
  const generated = mockSceneGenerator.generate({ story, turnNumber, actionSummary });
  const chapterNumber = Math.max(1, Math.ceil(turnNumber / 3));
  const scene = makeSceneFromGeneration(story, generated, chapterNumber);
  const nextStory = appendScene(story, scene);

  return { story: nextStory, scene };
}

function generateNextSceneFromResolution(
  story: Story,
  resolution: ActionResolutionResult,
): { story: Story; scene: Scene } {
  const turnNumber = story.scenes.length + 1;
  const generated = mockSceneGenerator.generate({
    story,
    turnNumber,
    actionSummary: resolution.actionSummary,
    actionResult: resolution,
  });
  const chapterNumber = Math.max(1, Math.ceil(turnNumber / 3));
  const scene = makeSceneFromGeneration(story, generated, chapterNumber);
  const nextStory = appendScene(story, scene);

  return { story: nextStory, scene };
}

export const mockStoryEngine: StoryEngine = {
  createStory(input: WizardStoryInput) {
    const seeded = mockStorySeedGenerator.generate(input);
    const first = generateNextScene(seeded.story, seeded.openingSceneDirection);

    return { story: first.story, firstScene: first.scene };
  },

  resolveChoice(story: Story, choiceId: string) {
    const scene = latestScene(story);
    const resolution = mockActionResolver.resolveChoice(scene, choiceId);
    return generateNextSceneFromResolution(story, resolution);
  },

  resolveCustomAction(story: Story, actionText: string) {
    const scene = latestScene(story);
    const resolution = mockActionResolver.resolveCustomAction(scene, actionText);
    return generateNextSceneFromResolution(story, resolution);
  },
};

export function createStoryFromWizardInput(input: WizardStoryInput): { story: Story; firstScene: Scene } {
  return mockStoryEngine.createStory(input);
}

export function generateFirstScene(story: Story, openingDirection: string): { story: Story; scene: Scene } {
  return generateNextScene(story, openingDirection);
}

export function resolveSelectedChoice(story: Story, choiceId: string): { story: Story; scene: Scene } {
  return mockStoryEngine.resolveChoice(story, choiceId);
}

export function resolveCustomActionInput(story: Story, actionText: string): { story: Story; scene: Scene } {
  return mockStoryEngine.resolveCustomAction(story, actionText);
}

export {
  generateNextSceneFromResolution,
  generateNextScene,
  latestScene,
  makeChoices,
};
