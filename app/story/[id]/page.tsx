import type { Metadata } from "next";
import { getStory } from "@/lib/engine";
import { StoryReader } from "@/components/story/StoryReader";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const story = getStory(decodeURIComponent(id));
  return { title: story ? story.title : "Story" };
}

export default async function StoryPage({ params }: Params) {
  const { id } = await params;
  return <StoryReader id={decodeURIComponent(id)} />;
}
