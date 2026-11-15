import type { Metadata } from "next";
import { getStory } from "@/lib/engine";
import { StoryReader } from "@/components/story/StoryReader";

type Params = { params: Promise<{ id: string }> };

function storyId(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const story = getStory(storyId(id));
  return { title: story ? story.title : "Story" };
}

export default async function StoryPage({ params }: Params) {
  const { id } = await params;
  return <StoryReader id={storyId(id)} />;
}
