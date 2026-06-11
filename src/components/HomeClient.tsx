"use client";

import { useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { FeedItem } from "@/lib/types";
import Navbar from "./Navbar";
import CategoryFilter from "./CategoryFilter";
import HotTopicCard from "./HotTopicCard";
import FeedCard from "./FeedCard";

interface HomeClientProps {
  user: { email: string } | null;
  allItems: FeedItem[];
  hotTopics: FeedItem[][];
}

export default function HomeClient({
  user,
  allItems,
  hotTopics,
}: HomeClientProps) {
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    let items = allItems;

    // Filter by category
    if (category !== "all") {
      items = items.filter((item) => item.source.category === category);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return items;
  }, [allItems, category, searchQuery]);

  const filteredHotTopics = useMemo(() => {
    if (category !== "all") return [];
    return hotTopics;
  }, [category, hotTopics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Re-fetch from API endpoint to bust cache
    try {
      await fetch("/api/feed?category=all", { cache: "no-store" });
    } catch {
      // ignore
    }
    setTimeout(() => {
      window.location.reload();
      setRefreshing(false);
    }, 500);
  };

  const handleFavorite = (item: FeedItem) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  };

  return (
    <>
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-6xl px-4 py-6 w-full">
        {/* Hero / Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">📡 AI 热点追踪</h2>
            <p className="text-sm text-muted-foreground mt-1">
              聚合 {allItems.length} 条来自全球信源的 AI 动态
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            刷新
          </button>
        </div>

        {/* Mobile search */}
        <div className="mb-4 sm:hidden">
          <input
            type="text"
            placeholder="搜索 AI 动态..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Category filter */}
        <CategoryFilter selected={category} onChange={setCategory} />

        {/* Hot Topics Section */}
        {filteredHotTopics.length > 0 && !searchQuery && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔥</span>
              <h3 className="text-lg font-semibold">当前热点</h3>
              <span className="text-xs text-muted-foreground">
                多信源热度 · 随时间消退
              </span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 divide-y divide-border">
              {filteredHotTopics.map((topic, idx) => (
                <HotTopicCard key={topic[0].id} rank={idx + 1} items={topic} />
              ))}
            </div>
          </section>
        )}

        {/* Feed Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📰</span>
            <h3 className="text-lg font-semibold">最新动态</h3>
            <span className="text-xs text-muted-foreground">
              {filteredItems.length} 条
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl">🔍</span>
              <p className="mt-4 text-muted-foreground">
                没有找到相关内容，换个关键词试试？
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.slice(0, 30).map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  isLoggedIn={!!user}
                  isFavorited={favorites.has(item.id)}
                  onFavorite={handleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            📡 AI Radar — AI 热点追踪器
          </p>
          <p className="text-xs text-muted-foreground">
            数据来源于公开 RSS，每 30 分钟更新
          </p>
        </div>
      </footer>
    </>
  );
}
