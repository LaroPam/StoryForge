import { z } from 'zod';

export const riskLevelSchema = z.enum(['low', 'medium', 'high']);

export const choiceIntentSchema = z.enum([
  'explore',
  'investigate',
  'social',
  'combat',
  'stealth',
  'resource',
  'defensive',
  'creative',
]);

export const choiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  intent: choiceIntentSchema,
  riskLevel: riskLevelSchema,
  requiredCheck: z.string().min(1).optional(),
  consequenceHint: z.string().min(1).optional(),
});

const sceneRelationshipChangeSchema = z.object({
  npcId: z.string().min(1),
  trustDelta: z.number(),
  tensionDelta: z.number(),
  note: z.string().min(1),
});

const sceneQuestUpdateSchema = z.object({
  questId: z.string().min(1),
  status: z.enum(['active', 'completed', 'failed']).optional(),
  progressDelta: z.number().optional(),
  note: z.string().min(1),
});

const inventoryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  rarity: z.enum(['common', 'rare', 'epic']),
});

export const sceneStateChangesSchema = z.object({
  dangerDelta: z.number(),
  inventoryAdded: z.array(inventoryItemSchema),
  inventoryRemovedIds: z.array(z.string().min(1)),
  relationshipChanges: z.array(sceneRelationshipChangeSchema),
  questUpdates: z.array(sceneQuestUpdateSchema),
  discoveredFactsAdded: z.array(z.string().min(1)),
});

export const actionResolutionResultSchema = z.object({
  actionSummary: z.string().min(1),
  dangerDelta: z.number(),
  relationshipHint: z.string().min(1),
  fact: z.string().min(1),
});

export const sceneGenerationResultSchema = z.object({
  chapterTitle: z.string().min(1),
  sceneTitle: z.string().min(1),
  sceneText: z.string().min(1),
  choices: z.array(choiceSchema).min(1),
  imagePrompt: z.string().min(1),
  stateChanges: sceneStateChangesSchema,
  hiddenDirectorNotes: z.string().min(1).optional(),
});

export const imagePromptResultSchema = z.string().min(1);

export type ChoiceSchemaType = z.infer<typeof choiceSchema>;
export type ActionResolutionResultSchemaType = z.infer<typeof actionResolutionResultSchema>;
export type SceneStateChangesSchemaType = z.infer<typeof sceneStateChangesSchema>;
export type SceneGenerationResultSchemaType = z.infer<typeof sceneGenerationResultSchema>;

function parseOrThrow<T>(schema: z.ZodSchema<T>, value: unknown, label: string): T {
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;

  throw new Error(`AI validation failed for ${label}: ${parsed.error.issues[0]?.message ?? 'invalid structure'}`);
}

export function validateActionResolutionResult(value: unknown) {
  return parseOrThrow(actionResolutionResultSchema, value, 'ActionResolutionResult');
}

export function validateSceneStateChanges(value: unknown) {
  return parseOrThrow(sceneStateChangesSchema, value, 'SceneStateChanges');
}

export function validateSceneGenerationResult(value: unknown) {
  return parseOrThrow(sceneGenerationResultSchema, value, 'SceneGenerationResult');
}

export function validateImagePromptResult(value: unknown) {
  return parseOrThrow(imagePromptResultSchema, value, 'ImagePromptResult');
}
