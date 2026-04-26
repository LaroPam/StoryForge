'use client';

import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const promptChips = [
  'A city where people lose their shadows',
  'A train crossing a dead world',
  'A girl receives a letter from her future self',
  'A magic academy where magic is forbidden',
  'A detective who can hear ghosts',
] as const;

const genres = [
  'Dark Fantasy',
  'Mystic Detective',
  'Space Odyssey',
  'Horror',
  'Romance',
  'Cyberpunk',
  'Post-apocalyptic',
  'Urban Fantasy',
] as const;

const tones = ['Cinematic', 'Dark', 'Cozy', 'Epic', 'Mysterious', 'Brutal', 'Fairy-tale', 'Anime-inspired'] as const;

const visualStyles = [
  'Cinematic realism',
  'Premium fantasy illustration',
  'Dark gothic',
  'Anime fantasy',
  'Watercolor dream',
  'Retro sci-fi',
] as const;

const storyLengths = ['Short adventure', 'Medium story', 'Long campaign'] as const;
const difficulties = ['Easy', 'Normal', 'Dangerous', 'Hardcore'] as const;

const steps = [
  'Story idea',
  'Genre',
  'Tone',
  'Visual style',
  'Character',
  'Story settings',
  'Preview',
] as const;

type CharacterMode = 'generate' | 'manual';

type WizardState = {
  idea: string;
  genre: (typeof genres)[number] | null;
  tone: (typeof tones)[number] | null;
  visualStyle: (typeof visualStyles)[number] | null;
  characterMode: CharacterMode;
  character: {
    name: string;
    role: string;
    strength: string;
    weakness: string;
    secret: string;
    goal: string;
    startingItem: string;
  };
  storyLength: (typeof storyLengths)[number] | null;
  difficulty: (typeof difficulties)[number] | null;
};

const initialState: WizardState = {
  idea: '',
  genre: null,
  tone: null,
  visualStyle: null,
  characterMode: 'generate',
  character: {
    name: '',
    role: '',
    strength: '',
    weakness: '',
    secret: '',
    goal: '',
    startingItem: '',
  },
  storyLength: null,
  difficulty: null,
};

const storyIdeaSchema = z.object({
  idea: z.string().min(12, 'Add a bit more detail to your story idea.'),
});

const manualCharacterSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  role: z.string().min(1, 'Role is required.'),
  strength: z.string().min(1, 'Strength is required.'),
  weakness: z.string().min(1, 'Weakness is required.'),
  secret: z.string().min(1, 'Secret is required.'),
  goal: z.string().min(1, 'Goal is required.'),
  startingItem: z.string().min(1, 'Starting item is required.'),
});

function selectCardClass(selected: boolean) {
  return cn(
    'rounded-xl border p-4 text-left text-sm transition-colors',
    selected ? 'border-zinc-200 bg-zinc-100 text-zinc-900' : 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-900'
  );
}

function makePreview(state: WizardState) {
  const protagonist =
    state.characterMode === 'manual' && state.character.name
      ? `${state.character.name}, ${state.character.role || 'a restless wanderer'}`
      : 'A newly awakened protagonist with an unfinished past';

  return {
    title: `${state.genre ?? 'Unknown'}: Echoes of the First Choice`,
    synopsis: `In a ${state.tone?.toLowerCase() ?? 'cinematic'} ${state.genre?.toLowerCase() ?? 'mystery'} world, ${protagonist} follows a fragile lead: ${state.idea.trim()}. Each decision reshapes memory, danger, and the fate of everyone involved.`,
    protagonist,
  };
}

export function StoryCreationWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardState>(initialState);
  const [error, setError] = useState<string | null>(null);

  const progress = ((step + 1) / steps.length) * 100;
  const preview = makePreview(data);

  function validateCurrentStep() {
    if (step === 0) {
      const result = storyIdeaSchema.safeParse({ idea: data.idea.trim() });
      if (!result.success) return result.error.issues[0]?.message ?? 'Please enter a story idea.';
    }

    if (step === 1 && !data.genre) return 'Choose a genre to continue.';
    if (step === 2 && !data.tone) return 'Choose a tone to continue.';
    if (step === 3 && !data.visualStyle) return 'Choose a visual style to continue.';

    if (step === 4 && data.characterMode === 'manual') {
      const result = manualCharacterSchema.safeParse(data.character);
      if (!result.success) return result.error.issues[0]?.message ?? 'Complete the protagonist details.';
    }

    if (step === 5) {
      if (!data.storyLength) return 'Select a story length.';
      if (!data.difficulty) return 'Select a difficulty.';
    }

    return null;
  }

  function nextStep() {
    const stepError = validateCurrentStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function prevStep() {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary" className="border border-zinc-700 bg-zinc-900/70 text-zinc-300">
            Story creation wizard
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Create your cinematic adventure</h1>
          <p className="text-zinc-300">Shape your world in seven guided steps. No coding, no clutter, just story craft.</p>
          <Progress value={progress} />
          <p className="text-sm text-zinc-400">
            Step {step + 1} of {steps.length}: {steps[step]}
          </p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur">
          <CardHeader>
            <CardTitle>{steps[step]}</CardTitle>
            <CardDescription>Every choice here influences your opening adventure preview.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <>
                    <Textarea
                      placeholder="Write your premise, dream, phrase, or first scene..."
                      value={data.idea}
                      onChange={(event) => setData((prev) => ({ ...prev, idea: event.target.value }))}
                      className="min-h-32"
                    />
                    <div className="flex flex-wrap gap-2">
                      {promptChips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                          onClick={() => setData((prev) => ({ ...prev, idea: chip }))}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        className={selectCardClass(data.genre === genre)}
                        onClick={() => setData((prev) => ({ ...prev, genre }))}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tones.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        className={selectCardClass(data.tone === tone)}
                        onClick={() => setData((prev) => ({ ...prev, tone }))}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {visualStyles.map((visualStyle) => (
                      <button
                        key={visualStyle}
                        type="button"
                        className={selectCardClass(data.visualStyle === visualStyle)}
                        onClick={() => setData((prev) => ({ ...prev, visualStyle }))}
                      >
                        {visualStyle}
                      </button>
                    ))}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <Tabs
                      value={data.characterMode}
                      onValueChange={(value) => setData((prev) => ({ ...prev, characterMode: value as CharacterMode }))}
                    >
                      <TabsList className="grid h-auto w-full grid-cols-2">
                        <TabsTrigger value="generate">Generate character</TabsTrigger>
                        <TabsTrigger value="manual">Manual character</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {data.characterMode === 'generate' ? (
                      <Card className="border-zinc-700 bg-zinc-900/70">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="h-4 w-4" /> Auto-generated protagonist
                          </CardTitle>
                          <CardDescription>
                            A mock protagonist will be generated for preview. You can edit details in the next phase.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          placeholder="Name"
                          value={data.character.name}
                          onChange={(event) =>
                            setData((prev) => ({ ...prev, character: { ...prev.character, name: event.target.value } }))
                          }
                        />
                        <Input
                          placeholder="Role"
                          value={data.character.role}
                          onChange={(event) =>
                            setData((prev) => ({ ...prev, character: { ...prev.character, role: event.target.value } }))
                          }
                        />
                        <Input
                          placeholder="Strength"
                          value={data.character.strength}
                          onChange={(event) =>
                            setData((prev) => ({ ...prev, character: { ...prev.character, strength: event.target.value } }))
                          }
                        />
                        <Input
                          placeholder="Weakness"
                          value={data.character.weakness}
                          onChange={(event) =>
                            setData((prev) => ({ ...prev, character: { ...prev.character, weakness: event.target.value } }))
                          }
                        />
                        <Input
                          placeholder="Secret"
                          value={data.character.secret}
                          onChange={(event) =>
                            setData((prev) => ({ ...prev, character: { ...prev.character, secret: event.target.value } }))
                          }
                        />
                        <Input
                          placeholder="Goal"
                          value={data.character.goal}
                          onChange={(event) =>
                            setData((prev) => ({ ...prev, character: { ...prev.character, goal: event.target.value } }))
                          }
                        />
                        <Input
                          placeholder="Starting item"
                          value={data.character.startingItem}
                          onChange={(event) =>
                            setData((prev) => ({
                              ...prev,
                              character: { ...prev.character, startingItem: event.target.value },
                            }))
                          }
                          className="sm:col-span-2"
                        />
                      </div>
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-zinc-300">Length</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {storyLengths.map((length) => (
                          <button
                            key={length}
                            type="button"
                            className={selectCardClass(data.storyLength === length)}
                            onClick={() => setData((prev) => ({ ...prev, storyLength: length }))}
                          >
                            {length}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm text-zinc-300">Difficulty</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {difficulties.map((difficulty) => (
                          <button
                            key={difficulty}
                            type="button"
                            className={selectCardClass(data.difficulty === difficulty)}
                            onClick={() => setData((prev) => ({ ...prev, difficulty }))}
                          >
                            {difficulty}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-4">
                    <Card className="border-zinc-700 bg-zinc-900/70">
                      <CardHeader>
                        <CardTitle className="text-xl">{preview.title}</CardTitle>
                        <CardDescription>{preview.synopsis}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-zinc-200">
                        <p>
                          <span className="text-zinc-400">Protagonist:</span> {preview.protagonist}
                        </p>
                        <p>
                          <span className="text-zinc-400">Genre:</span> {data.genre}
                        </p>
                        <p>
                          <span className="text-zinc-400">Tone:</span> {data.tone}
                        </p>
                        <p>
                          <span className="text-zinc-400">Visual style:</span> {data.visualStyle}
                        </p>
                        <p>
                          <span className="text-zinc-400">Difficulty:</span> {data.difficulty}
                        </p>
                      </CardContent>
                    </Card>
                    <Button size="lg" className="w-full sm:w-auto">
                      Start story
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={prevStep} disabled={step === 0}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={nextStep}>Continue</Button>
          ) : (
            <Button variant="secondary" onClick={() => setStep(0)}>
              Create another story
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
