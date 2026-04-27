'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useStoryStore } from '@/store/story-store';

const lengthTargets: Record<'Short adventure' | 'Medium story' | 'Long campaign', number> = {
  'Short adventure': 8,
  'Medium story': 14,
  'Long campaign': 22,
};

type Props = { storyId: string };

export function AdventureScenePlayer({ storyId }: Props) {
  const {
    hasHydrated,
    currentStory,
    currentScene,
    sceneHistory,
    worldState,
    isLoading,
    error,
    hasStarted,
    startStory,
    chooseAction,
    submitCustomAction,
  } = useStoryStore();

  const [customAction, setCustomAction] = useState('');

  useEffect(() => {
    if (currentStory?.id === storyId && !hasStarted) {
      startStory();
    }
  }, [currentStory, hasStarted, startStory, storyId]);

  const progressValue = useMemo(() => {
    if (!currentStory) return 0;
    const target = lengthTargets[currentStory.length];
    return Math.min(100, Math.round((sceneHistory.length / target) * 100));
  }, [currentStory, sceneHistory.length]);

  const danger = worldState?.dangerLevel ?? 0;
  const health = Math.max(1, 100 - danger);
  const will = Math.max(1, 100 - Math.floor(danger * 0.7));

  if (!hasHydrated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6">
        <Card className="w-full border-zinc-800 bg-zinc-900/70">
          <CardHeader>
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-5 w-72" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!currentStory || !currentScene || !worldState) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6">
        <Card className="w-full border-zinc-800 bg-zinc-900/70">
          <CardHeader>
            <CardTitle className="text-2xl">No active story found</CardTitle>
            <CardDescription>Start a new adventure or return to your library.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-300">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/create">Start new adventure</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/library">Go to library</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const hasMismatchedStory = currentStory.id !== storyId;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="min-w-0 flex-1 space-y-6">
          <header className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{currentScene.chapterTitle}</p>
                <h1 className="text-2xl font-semibold sm:text-3xl">{currentStory.title}</h1>
                <p className="text-sm text-zinc-400">
                  Scene {sceneHistory.length} of ~{lengthTargets[currentStory.length]} • {currentScene.sceneTitle}
                </p>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-zinc-700 text-zinc-100 hover:bg-zinc-900">
                    <BookOpen className="h-4 w-4" /> World panel
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto border-zinc-800 bg-zinc-950">
                  <SheetHeader>
                    <SheetTitle>World & Character</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <WorldPanelContent health={health} will={will} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="mt-4 space-y-2">
              <Progress value={progressValue} />
              <p className="text-xs text-zinc-400">Adventure progress</p>
            </div>
          </header>

          {hasMismatchedStory && (
            <Card className="border-amber-700/60 bg-amber-950/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-amber-100">This URL story id does not match the currently loaded story.</p>
                <Button variant="secondary" asChild>
                  <Link href="/create">Create a new story</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50">
            <div className="relative aspect-[16/8] w-full border-b border-zinc-800 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
              {isLoading ? <Skeleton className="absolute inset-0 h-full w-full" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <p className="text-sm text-zinc-300">{currentScene.imagePrompt}</p>
                <Badge variant="secondary" className="shrink-0 bg-zinc-900/80 text-zinc-200">
                  Cinematic placeholder
                </Badge>
              </div>
            </div>
          </Card>

          <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold">{currentScene.sceneTitle}</h2>
            <p className="max-w-3xl text-pretty text-base leading-8 text-zinc-200 sm:text-lg">{currentScene.sceneText}</p>
          </article>

          <section className="space-y-3">
            <h3 className="text-lg font-medium">Choices</h3>
            <div className="grid gap-3">
              {currentScene.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => chooseAction(choice.id)}
                  className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 text-left transition-colors hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <p className="font-medium">{choice.label}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-300">
                    <Badge variant="outline">Risk: {choice.riskLevel}</Badge>
                    {choice.requiredCheck ? <Badge variant="outline">Check: {choice.requiredCheck}</Badge> : null}
                    {choice.consequenceHint ? <Badge variant="outline">{choice.consequenceHint}</Badge> : null}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
            <h3 className="text-lg font-medium">Custom action</h3>
            <Textarea
              value={customAction}
              onChange={(event) => setCustomAction(event.target.value)}
              placeholder="Describe your own action..."
              className="min-h-28"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-400">Try bold actions—the engine will convert impossible actions into consequences.</p>
              <Button
                onClick={() => {
                  submitCustomAction(customAction);
                  setCustomAction('');
                }}
                disabled={isLoading || !customAction.trim()}
              >
                Submit action
              </Button>
            </div>
          </section>

          {isLoading ? (
            <p className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-300">
              The next page is forming... echoes gather around your last decision.
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-rose-800/80 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">{error}</p>
          ) : null}
        </section>

        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-80 shrink-0 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 xl:block">
          <WorldPanelContent health={health} will={will} />
        </aside>
      </div>
    </main>
  );
}

function WorldPanelContent({ health, will }: { health: number; will: number }) {
  const { currentStory, worldState } = useStoryStore();

  if (!currentStory || !worldState) return null;

  return (
    <div className="space-y-5">
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-300">
          <UserRound className="h-4 w-4" /> Character
        </h3>
        <p className="mt-2 text-lg font-medium">{currentStory.protagonist.name}</p>
        <p className="text-sm text-zinc-400">{currentStory.protagonist.role}</p>
        <p className="mt-2 text-sm text-zinc-300">Goal: {currentStory.protagonist.goal}</p>
      </section>

      <Separator />

      <section className="grid grid-cols-3 gap-2 text-center text-sm">
        <StatPill label="Health" value={health} />
        <StatPill label="Will" value={will} />
        <StatPill label="Danger" value={worldState.dangerLevel} warning />
      </section>

      <Separator />

      <section className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Inventory</h4>
        {worldState.inventory.length === 0 ? (
          <p className="text-sm text-zinc-400">No items yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-zinc-200">
            {worldState.inventory.map((item) => (
              <li key={item.id} className="rounded-md border border-zinc-700 bg-zinc-900/60 p-2">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-zinc-400">{item.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Relationships</h4>
        <ul className="space-y-2 text-sm">
          {worldState.relationships.map((rel) => (
            <li key={rel.npcId} className="rounded-md border border-zinc-700 bg-zinc-900/60 p-2">
              <p className="font-medium text-zinc-100">{rel.npcName}</p>
              <p className="text-xs text-zinc-400">
                Trust {rel.trust} • Tension {rel.tension}
              </p>
              <p className="text-xs text-zinc-300">{rel.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Active quests</h4>
        <ul className="space-y-2 text-sm">
          {worldState.quests.map((quest) => (
            <li key={quest.id} className="rounded-md border border-zinc-700 bg-zinc-900/60 p-2">
              <p className="font-medium text-zinc-100">{quest.title}</p>
              <p className="text-xs text-zinc-400">{quest.summary}</p>
              <p className="text-xs text-zinc-300">Status: {quest.status} • Progress: {quest.progress}%</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Discovered facts</h4>
        <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
          {worldState.discoveredFacts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatPill({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-2 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={warning ? 'text-sm font-semibold text-amber-300' : 'text-sm font-semibold text-zinc-100'}>{value}</p>
    </div>
  );
}
