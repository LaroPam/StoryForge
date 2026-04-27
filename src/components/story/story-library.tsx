'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpen, Compass, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Story } from '@/domain/story';
import { useStoryStore } from '@/store/story-store';

type LibraryFilter = 'all' | 'active' | 'completed' | 'draft';

const lengthTargets: Record<Story['length'], number> = {
  'Short adventure': 8,
  'Medium story': 14,
  'Long campaign': 22,
};

function getStoryStatus(story: Story): 'draft' | 'active' | 'completed' {
  if (story.scenes.length <= 1) return 'draft';

  const target = lengthTargets[story.length];
  const progressRatio = story.scenes.length / target;
  const questsCompleted = story.worldState.quests.length > 0 && story.worldState.quests.every((quest) => quest.status === 'completed');

  if (progressRatio >= 1 || questsCompleted) return 'completed';
  return 'active';
}

function getStoryProgress(story: Story) {
  const target = lengthTargets[story.length];
  return Math.min(100, Math.round((story.scenes.length / target) * 100));
}

export function StoryLibrary() {
  const stories = useStoryStore((state) => state.stories);
  const currentStoryId = useStoryStore((state) => state.currentStory?.id);
  const [filter, setFilter] = useState<LibraryFilter>('all');

  const filteredStories = useMemo(() => {
    if (filter === 'all') return stories;
    return stories.filter((story) => getStoryStatus(story) === filter);
  }, [filter, stories]);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="border border-zinc-700 bg-zinc-900/80 text-zinc-300">
                Story library
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your adventures</h1>
              <p className="max-w-2xl text-zinc-300">
                Continue active arcs, revisit finished endings, or begin a new cinematic journey.
              </p>
            </div>
            <Button asChild>
              <Link href="/create">
                <Sparkles className="h-4 w-4" /> Create new story
              </Link>
            </Button>
          </div>
        </header>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as LibraryFilter)}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredStories.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">No stories here yet</CardTitle>
              <CardDescription>
                Your personal library is waiting for its first adventure. Start with one idea and let the world unfold.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild size="lg">
                <Link href="/create">
                  <Compass className="h-4 w-4" /> Start your first adventure
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredStories.map((story) => {
              const status = getStoryStatus(story);
              const progress = getStoryProgress(story);
              const lastSceneTitle = story.scenes[story.scenes.length - 1]?.sceneTitle ?? 'Opening scene pending';

              return (
                <Card key={story.id} className="overflow-hidden border-zinc-800 bg-zinc-900/60">
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute left-3 top-3 border border-zinc-700 bg-zinc-900/80 text-zinc-200">
                      {story.genre}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-xl">{story.title}</CardTitle>
                      <Badge variant={status === 'completed' ? 'default' : status === 'active' ? 'secondary' : 'outline'}>
                        {status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {story.tone} • {story.length}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-xs text-zinc-400">Progress: {progress}%</p>
                    </div>
                    <p className="text-sm text-zinc-300">Last scene: {lastSceneTitle}</p>
                    <Button asChild className="w-full" variant={currentStoryId === story.id ? 'secondary' : 'default'}>
                      <Link href={`/story/${story.id}`}>
                        <BookOpen className="h-4 w-4" /> Continue
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
