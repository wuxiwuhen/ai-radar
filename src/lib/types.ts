export interface FeedItem {
  id: string;
  title: string;
  link: string;
  description: string;
  content: string;
  pubDate: string;
  source: {
    id: string;
    name: string;
    icon: string;
    category: string;
  };
  tags: string[];
  heatScore: number;
}

export interface HotTopic {
  id: string;
  title: string;
  sources: {
    id: string;
    name: string;
    icon: string;
  }[];
  heatScore: number;
  publishedAt: string;
  items: FeedItem[];
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  favorite_tags: string[];
  favorite_sources: string[];
}

export interface FavoriteItem {
  id: string;
  user_id: string;
  feed_item_id: string;
  note: string;
  created_at: string;
}
