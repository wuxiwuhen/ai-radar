// RSS 信息源配置 - 精选自 AIHOT 的优质 RSS 源
export interface RSSSource {
  id: string;
  name: string;
  url: string;
  category: string;
  icon: string; // emoji icon
  language: "zh" | "en";
}

export const RSS_SOURCES: RSSSource[] = [
  // === AI 官方博客 ===
  {
    id: "anthropic-blog",
    name: "Anthropic Blog",
    url: "https://www.anthropic.com/feed.xml",
    category: "官方博客",
    icon: "🟣",
    language: "en",
  },
  {
    id: "openai-blog",
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
    category: "官方博客",
    icon: "🟢",
    language: "en",
  },
  {
    id: "google-deepmind",
    name: "Google DeepMind Blog",
    url: "https://blog.google/technology/ai/rss/",
    category: "官方博客",
    icon: "🔵",
    language: "en",
  },
  {
    id: "google-ai-blog",
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
    category: "官方博客",
    icon: "🔵",
    language: "en",
  },
  {
    id: "huggingface-papers",
    name: "HuggingFace Daily Papers",
    url: "https://huggingface.co/papers/rss",
    category: "论文研究",
    icon: "🤗",
    language: "en",
  },

  // === 科技媒体 ===
  {
    id: "techcrunch-ai",
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "科技媒体",
    icon: "📰",
    language: "en",
  },
  {
    id: "the-verge-ai",
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    category: "科技媒体",
    icon: "⚡",
    language: "en",
  },
  {
    id: "the-decoder",
    name: "The Decoder",
    url: "https://the-decoder.com/feed/",
    category: "科技媒体",
    icon: "🔓",
    language: "en",
  },
  {
    id: "ars-technica-ai",
    name: "Ars Technica AI",
    url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    category: "科技媒体",
    icon: "🔬",
    language: "en",
  },
  {
    id: "marktechpost",
    name: "MarkTechPost",
    url: "https://www.marktechpost.com/feed/",
    category: "科技媒体",
    icon: "📊",
    language: "en",
  },

  // === 开发者/工程 ===
  {
    id: "github-blog",
    name: "GitHub Blog",
    url: "https://github.blog/feed/",
    category: "开发者",
    icon: "🐙",
    language: "en",
  },
  {
    id: "cursor-blog",
    name: "Cursor Blog",
    url: "https://www.cursor.com/feed",
    category: "开发者",
    icon: "🖱️",
    language: "en",
  },
  {
    id: "openrouter",
    name: "OpenRouter Announcements",
    url: "https://openrouter.ai/feed",
    category: "开发者",
    icon: "🔀",
    language: "en",
  },

  // === 中文源 ===
  {
    id: "ithome",
    name: "IT之家",
    url: "https://www.ithome.com/rss/",
    category: "中文媒体",
    icon: "🏠",
    language: "zh",
  },
  {
    id: "hn-buzzing",
    name: "Hacker News (中文翻译)",
    url: "https://buzzing.cc/hottest/hn/feed.xml",
    category: "社区",
    icon: "🔶",
    language: "zh",
  },

  // === 思想/观点 ===
  {
    id: "gary-marcus",
    name: "Gary Marcus",
    url: "https://garymarcus.substack.com/feed",
    category: "观点评论",
    icon: "🧠",
    language: "en",
  },
];

export const RSS_CATEGORIES = [
  { id: "all", name: "全部" },
  { id: "官方博客", name: "官方博客" },
  { id: "科技媒体", name: "科技媒体" },
  { id: "论文研究", name: "论文研究" },
  { id: "开发者", name: "开发者" },
  { id: "中文媒体", name: "中文媒体" },
  { id: "社区", name: "社区" },
  { id: "观点评论", name: "观点评论" },
];
