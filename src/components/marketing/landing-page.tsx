import Link from 'next/link';
import { ArrowRight, BookOpenText, Compass, Sparkles, Swords, Wand2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const howItWorks = [
  {
    title: 'Enter an idea',
    description: 'A dream, a phrase, a scene, or a mystery. One spark is enough.',
    icon: Sparkles,
  },
  {
    title: 'Choose style',
    description: 'Set genre, tone, visual mood, and adventure intensity.',
    icon: Compass,
  },
  {
    title: 'Create hero',
    description: 'Define your protagonist with strengths, flaws, and purpose.',
    icon: Wand2,
  },
  {
    title: 'Play the story',
    description: 'Make choices and custom actions. Face consequences and endings.',
    icon: Swords,
  },
];

const genres = ['Dark Fantasy', 'Mystic Detective', 'Space Odyssey', 'Horror', 'Romance', 'Cyberpunk'];

const features = [
  'AI-generated scene illustrations',
  'Choices and consequences',
  'Persistent world memory',
  'Inventory and quests',
  'NPC relationships',
  'Multiple endings',
];

const sceneCards = [
  {
    title: 'The Lantern District',
    excerpt: 'Fog coils above canals as your oath begins to unravel under moonlight.',
  },
  {
    title: 'Orbit of Ash',
    excerpt: 'A silent station drifts near a dead star while your crew waits for your command.',
  },
  {
    title: 'The Last Door',
    excerpt: 'Every step through the cathedral archive rewrites a memory you cannot lose.',
  },
];

export function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-1/3 -left-16 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <section className="mx-auto flex min-h-[92vh] w-full max-w-6xl flex-col justify-center gap-10 px-6 py-20 md:px-10">
        <Badge variant="secondary" className="w-fit border border-zinc-700 bg-zinc-900/70 text-zinc-200">
          Premium cinematic interactive story adventure
        </Badge>

        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
              Write one idea and enter a living illustrated adventure.
            </h1>
            <p className="max-w-2xl text-lg text-zinc-300 sm:text-xl">
              Shape every scene through choices, consequences, memory, relationships, quests, and endings that feel
              uniquely yours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
                <Link href="/create">
                  Start adventure <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-zinc-700 text-zinc-100 hover:bg-zinc-900">
                <Link href="#story-player-preview">View demo</Link>
              </Button>
            </div>
          </div>

          <Card id="story-player-preview" className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl">Story Player Preview</CardTitle>
              <CardDescription>Atmospheric mockup of the in-adventure reading experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">Chapter I · Scene II</p>
                <p className="text-sm leading-relaxed text-zinc-300">
                  Rain hammers the ruined observatory as you decide whether to trust the voice behind the mirror.
                </p>
              </div>
              <div className="grid gap-2">
                {['Step through the mirror', 'Hold your ground', 'Ask who speaks your name'].map((choice) => (
                  <button
                    key={choice}
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-sm text-zinc-200"
                    type="button"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((item) => (
            <Card key={item.title} className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <item.icon className="h-5 w-5 text-zinc-300" />
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <h2 className="text-2xl font-semibold sm:text-3xl">Genre showcase</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {genres.map((genre) => (
            <Card key={genre} className="border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
              <CardHeader>
                <CardTitle className="text-lg">{genre}</CardTitle>
                <CardDescription>Curated tone, atmosphere, and pacing for this world.</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <h2 className="text-2xl font-semibold sm:text-3xl">Why it feels alive</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature} className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-lg">{feature}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <h2 className="text-2xl font-semibold sm:text-3xl">Scene gallery teaser</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {sceneCards.map((scene) => (
            <Card key={scene.title} className="overflow-hidden border-zinc-800 bg-zinc-900/60">
              <div className="aspect-[5/3] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
              <CardHeader>
                <CardTitle className="text-lg">{scene.title}</CardTitle>
                <CardDescription>{scene.excerpt}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <Card className="border-zinc-700 bg-zinc-900/70">
          <CardHeader>
            <Badge className="w-fit bg-zinc-100 text-zinc-900">Early Access</Badge>
            <CardTitle className="mt-2 text-2xl">Join early and unlock premium storytelling potential</CardTitle>
            <CardDescription>
              Explore the free experience first, then opt into premium possibilities like longer campaigns and richer
              illustrated moments as they roll out.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 md:px-10">
        <Separator className="mb-10" />
        <div className="space-y-4 text-center">
          <BookOpenText className="mx-auto h-8 w-8 text-zinc-300" />
          <h2 className="text-3xl font-semibold">Your next adventure is one idea away</h2>
          <p className="mx-auto max-w-2xl text-zinc-300">
            Start your first story now and discover how every choice can reshape the world around your protagonist.
          </p>
          <Button asChild size="lg" className="mt-2 bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
            <Link href="/create">Start adventure</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
