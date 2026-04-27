import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getServerStoryEngine } from '@/domain/ai/server-engine';
import { STORY_DIFFICULTIES, STORY_GENRES, STORY_LENGTHS, STORY_TONES, VISUAL_STYLES } from '@/domain/story';
import type { Story } from '@/domain/story';

const wizardInputSchema = z.object({
  idea: z.string().min(1),
  genre: z.enum(STORY_GENRES),
  tone: z.enum(STORY_TONES),
  visualStyle: z.enum(VISUAL_STYLES),
  difficulty: z.enum(STORY_DIFFICULTIES),
  length: z.enum(STORY_LENGTHS),
  characterMode: z.enum(['generate', 'manual']),
  character: z
    .object({
      name: z.string().optional(),
      role: z.string().optional(),
      strength: z.string().optional(),
      weakness: z.string().optional(),
      secret: z.string().optional(),
      goal: z.string().optional(),
      startingItem: z.string().optional(),
    })
    .optional(),
});

const storyPayloadSchema = z.custom<Story>(
  (value) =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    Array.isArray((value as { scenes?: unknown }).scenes),
  {
    message: 'Invalid story payload.',
  },
);

const startRequestSchema = z.object({
  action: z.literal('start'),
  input: wizardInputSchema,
});

const choiceRequestSchema = z.object({
  action: z.literal('choice'),
  story: storyPayloadSchema,
  choiceId: z.string().min(1),
});

const customActionRequestSchema = z.object({
  action: z.literal('customAction'),
  story: storyPayloadSchema,
  actionText: z.string().min(1),
});

const requestSchema = z.discriminatedUnion('action', [startRequestSchema, choiceRequestSchema, customActionRequestSchema]);

const responseSchema = z.object({
  story: storyPayloadSchema,
  currentScene: z.unknown().nullable(),
  worldState: z.unknown().nullable(),
  sceneHistory: z.array(z.unknown()),
  error: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid story API payload.' }, { status: 400 });
    }

    const engine = getServerStoryEngine();

    if (parsed.data.action === 'start') {
      const result = await engine.createStory(parsed.data.input);

      const payload = {
        story: result.story,
        currentScene: result.firstScene ?? null,
        worldState: result.story.worldState ?? null,
        sceneHistory: result.story.scenes ?? [],
      };

      const safePayload = responseSchema.safeParse(payload);
      if (!safePayload.success) {
        return NextResponse.json({ error: 'Invalid story API response payload.' }, { status: 500 });
      }

      return NextResponse.json(safePayload.data);
    }

    const result =
      parsed.data.action === 'choice'
        ? await engine.resolveChoice(parsed.data.story, parsed.data.choiceId)
        : await engine.resolveCustomAction(parsed.data.story, parsed.data.actionText.trim());

    const payload = {
      story: result.story,
      currentScene: result.scene ?? null,
      worldState: result.story.worldState ?? null,
      sceneHistory: result.story.scenes ?? [],
    };

    const safePayload = responseSchema.safeParse(payload);
    if (!safePayload.success) {
      return NextResponse.json({ error: 'Invalid story API response payload.' }, { status: 500 });
    }

    return NextResponse.json(safePayload.data);
  } catch {
    return NextResponse.json({ error: 'Unable to process story request.' }, { status: 500 });
  }
}
