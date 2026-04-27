import { AdventureScenePlayer } from '@/components/story/adventure-scene-player';

type PageProps = {
  params?: Promise<{ id?: string | string[] }>;
};

function resolveStoryId(id: string | string[] | undefined) {
  if (Array.isArray(id)) return id[0] ?? '';
  return id ?? '';
}

export default async function StoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const storyId = resolveStoryId(resolvedParams?.id);

  return <AdventureScenePlayer storyId={storyId} />;
}
