import { AdventureScenePlayer } from '@/components/story/adventure-scene-player';

type PageProps = {
  params: { id: string };
};

export default function StoryPage({ params }: PageProps) {
  return <AdventureScenePlayer storyId={params.id} />;
}
