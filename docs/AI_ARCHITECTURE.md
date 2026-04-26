# AI Architecture

## Principle

The AI system must not be a direct chatbot wrapper.

The product needs a structured story engine that uses AI providers behind interfaces.

UI should never call AI providers directly.

Preferred flow:

```txt
UI → Story Engine → AI Interfaces → Provider Implementations
```

## MVP approach

Start with mock providers.

The mock story loop must be playable before real AI integration.

Real AI should only replace the provider layer later.

## Core AI roles

### StorySeedGenerator

Creates initial story seed from wizard input:

- title
- synopsis
- protagonist
- main conflict
- initial world state
- initial quests
- opening scene direction

### SceneGenerator

Generates the next structured scene:

- chapter title
- scene title
- scene text
- choices
- image prompt
- state changes
- hidden director notes

### ActionResolver

Evaluates selected choices or custom user actions.

Responsibilities:

- reject impossible god-mode actions
- convert impossible actions into attempts
- allow success, partial success, failure, or success with cost
- preserve story logic
- produce consequences

### WorldStateUpdater

Updates structured world state:

- character state
- inventory
- quests
- NPC relationships
- discovered facts
- unresolved mysteries
- current location
- danger level

### ImagePromptGenerator

Creates a visual prompt for a scene based on:

- scene content
- visual style
- character references
- location references
- world visual bible

### ImageGenerator

Generates or returns image assets.

MVP uses placeholders only.

## Required interfaces

Create interfaces for:

- StorySeedGenerator
- SceneGenerator
- ActionResolver
- WorldStateUpdater
- ImagePromptGenerator
- ImageGenerator

## Mock implementations

Create mock implementations first:

- mockStorySeedGenerator
- mockSceneGenerator
- mockActionResolver
- mockWorldStateUpdater
- mockImagePromptGenerator
- mockImageGenerator

## Structured AI output

Future real AI responses must be JSON-like structured data validated with Zod.

Scene output should include:

```ts
type SceneGenerationResult = {
  chapterTitle: string;
  sceneTitle: string;
  sceneText: string;
  choices: Choice[];
  imagePrompt: string;
  stateUpdates: WorldStateUpdate;
  hiddenDirectorNotes?: string;
};
```

Hidden director notes must never be displayed to the user.

## Memory model

Do not send the full story to the model every turn.

Use layered memory:

1. Product/system rules
2. Story settings
3. World summary
4. Structured world state
5. Active quests and unresolved mysteries
6. Recent scenes
7. User action

## Story continuity rules

The story must preserve:

- protagonist facts
- world rules
- genre and tone
- inventory
- relationships
- unresolved mysteries
- consequences of prior choices

## Impossible action handling

User can write any custom action, but the world does not blindly accept it.

Example:

User action:

```txt
I become an immortal god and destroy all enemies.
```

Bad handling:

```txt
You become an immortal god and win.
```

Good handling:

```txt
You try to draw impossible power into yourself. The ritual backfires, your vision burns white, and the enemy now understands what you were attempting. Danger increases.
```

## Image generation strategy

MVP:

- generate image prompts only
- show premium placeholders

Later:

- generate cover
- generate key scenes
- generate per-scene images for premium users
- keep visual consistency through `VisualBible`

## VisualBible concept

A story should have a visual bible:

- visual style
- color palette
- lighting
- mood
- composition rules
- protagonist visual reference
- key NPC visual references
- key location references
- negative constraints

This helps maintain consistent images across scenes.
