import { FeedItem } from "./types";
import { RSS_SOURCES, RSSSource } from "./rss-sources";

// Simple RSS/Atom XML parser (no external dependency needed)
function extractText(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  if (!match) return "";
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*?${attr}=["']([^"']*)["']`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}

function parseRSSItems(xml: string, source: RSSSource): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = xml.match(itemRegex) || [];

  for (const itemXml of matches.slice(0, 20)) {
    const title = extractText(itemXml, "title");
    const link =
      extractText(itemXml, "link") || extractAttr(itemXml, "link", "href");
    const description = extractText(itemXml, "description");
    const content =
      extractText(itemXml, "content:encoded") || description;
    const pubDate = extractText(itemXml, "pubDate");

    if (!title) continue;

    items.push({
      id: `${source.id}-${Buffer.from(title).toString("base64").slice(0, 20)}`,
      title,
      link,
      description: description.slice(0, 300),
      content: content.slice(0, 1000),
      pubDate: pubDate || new Date().toISOString(),
      source: {
        id: source.id,
        name: source.name,
        icon: source.icon,
        category: source.category,
      },
      tags: extractTags(title + " " + description),
      heatScore: calculateHeatScore(pubDate),
    });
  }

  return items;
}

function parseAtomEntries(xml: string, source: RSSSource): FeedItem[] {
  const items: FeedItem[] = [];
  const entryRegex = /<entry[\s\S]*?<\/entry>/gi;
  const matches = xml.match(entryRegex) || [];

  for (const entryXml of matches.slice(0, 20)) {
    const title = extractText(entryXml, "title");
    const link =
      extractAttr(entryXml, "link", "href") ||
      extractText(entryXml, "link");
    const summary = extractText(entryXml, "summary") || extractText(entryXml, "content");
    const content = extractText(entryXml, "content") || summary;
    const pubDate =
      extractText(entryXml, "published") ||
      extractText(entryXml, "updated");

    if (!title) continue;

    items.push({
      id: `${source.id}-${Buffer.from(title).toString("base64").slice(0, 20)}`,
      title,
      link,
      description: summary.slice(0, 300),
      content: content.slice(0, 1000),
      pubDate: pubDate || new Date().toISOString(),
      source: {
        id: source.id,
        name: source.name,
        icon: source.icon,
        category: source.category,
      },
      tags: extractTags(title + " " + summary),
      heatScore: calculateHeatScore(pubDate),
    });
  }

  return items;
}

const AI_KEYWORDS = [
  "AI", "GPT", "LLM", "Claude", "Gemini", "ChatGPT", "OpenAI", "Anthropic",
  "machine learning", "deep learning", "neural", "transformer", "diffusion",
  "AI", "人工智能", "大模型", "深度学习", "机器学习",
  "DeepSeek", "Llama", "Mistral", "模型", "推理", "训练",
  "agent", "智能体", "MCP", "RAG", "RLHF",
];

function extractTags(text: string): string[] {
  const tags: string[] = [];
  const tagMap: Record<string, string[]> = {
    "模型发布": ["发布", "release", "launch", "开源", "open source", "新模型"],
    "论文研究": ["paper", "arxiv", "论文", "research", "研究"],
    "产品更新": ["update", "新功能", "升级", "更新", "发布"],
    "编码": ["code", "coding", "编程", "开发", "CLI", "Copilot", "Cursor"],
    "安全/对齐": ["safety", "alignment", "安全", "对齐", "风险"],
    "开源生态": ["open source", "开源", "GitHub", "Hugging Face"],
    "政策/监管": ["regulation", "policy", "监管", "政策", "法规"],
    "推理": ["reasoning", "inference", "推理"],
    "多模态": ["multimodal", "vision", "image", "video", "多模态"],
    "智能体": ["agent", "智能体", "MCP", "tool"],
  };

  const lowerText = text.toLowerCase();
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some((kw) => lowerText.includes(kw.toLowerCase()))) {
      tags.push(tag);
    }
  }

  if (tags.length === 0) tags.push("AI动态");
  return tags.slice(0, 4);
}

function calculateHeatScore(pubDate: string): number {
  if (!pubDate) return 50;
  try {
    const date = new Date(pubDate);
    const now = new Date();
    const hoursAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    // Base score 50-90, decays with time
    const baseScore = 90;
    const decay = Math.max(0, hoursAgo * 2);
    return Math.max(20, Math.round(baseScore - decay));
  } catch {
    return 50;
  }
}

export async function fetchFeed(source: RSSSource): Promise<FeedItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AI-Radar/1.0 RSS Reader",
        Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml",
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`);
      return [];
    }

    const xml = await response.text();

    // Detect format: RSS or Atom
    if (xml.includes("<entry")) {
      return parseAtomEntries(xml, source);
    }
    return parseRSSItems(xml, source);
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllFeeds(
  category?: string
): Promise<FeedItem[]> {
  const sources = category && category !== "all"
    ? RSS_SOURCES.filter((s) => s.category === category)
    : RSS_SOURCES;

  const results = await Promise.allSettled(
    sources.map((source) => fetchFeed(source))
  );

  const allItems = results
    .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Sort by heat score (descending), then by date
  allItems.sort((a, b) => {
    if (b.heatScore !== a.heatScore) return b.heatScore - a.heatScore;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  return allItems;
}

// Group related items into "hot topics"
export function groupHotTopics(items: FeedItem[]): FeedItem[][] {
  const topics: FeedItem[][] = [];
  const used = new Set<number>();

  for (let i = 0; i < items.length; i++) {
    if (used.has(i)) continue;

    const group = [items[i]];
    used.add(i);

    for (let j = i + 1; j < items.length; j++) {
      if (used.has(j)) continue;

      const similarity = calculateSimilarity(
        items[i].title.toLowerCase(),
        items[j].title.toLowerCase()
      );

      if (similarity > 0.3) {
        group.push(items[j]);
        used.add(j);
      }
    }

    topics.push(group);
  }

  return topics.sort((a, b) => {
    const scoreA = Math.max(...a.map((i) => i.heatScore)) + a.length * 5;
    const scoreB = Math.max(...b.map((i) => i.heatScore)) + b.length * 5;
    return scoreB - scoreA;
  });
}

function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w) && w.length > 3);
  const union = new Set([...wordsA, ...wordsB]);
  return union.size > 0 ? intersection.length / union.size : 0;
}
