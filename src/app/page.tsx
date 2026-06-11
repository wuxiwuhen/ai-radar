import { createClient } from "@/lib/supabase/server";
import { fetchAllFeeds, groupHotTopics } from "@/lib/rss-parser";
import HomeClient from "@/components/HomeClient";

export const revalidate = 1800; // Revalidate every 30 minutes

export default async function HomePage() {
  // Get user session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all feeds server-side
  const allItems = await fetchAllFeeds();
  const hotTopics = groupHotTopics(allItems).slice(0, 10);

  return (
    <HomeClient
      user={user ? { email: user.email ?? "" } : null}
      allItems={allItems}
      hotTopics={hotTopics}
    />
  );
}
