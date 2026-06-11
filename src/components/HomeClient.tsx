"use client";

import { useState, useMemo, useEffect } from "react";
import { TrendingUp, RefreshCw, Bookmark, Search, Menu, X } from "lucide-react";
import { FeedItem } from "@/lib/types";
import Sidebar from "./Sidebar";
import CategoryFilter from "./CategoryFilter";
import HotTopicCard from "./HotTopicCard";
import FeedCard from "./FeedCard";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface HomeClientProps {
  user: { email: string } | null;
  allItems: FeedItem[];
  hotTopics: FeedItem[][];
}

function groupByDate(items: FeedItem[]) {
  const groups: Map<string, FeedItem[]> = new Map();
  for (const item of items) {
    try {
      const key = format(new Date(item.pubDate), "yyyy-MM-dd");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    } catch {
      if (!groups.has("unknown")) groups.set("unknown", []);
      groups.get("unknown")!.push(item);
    }
  }
  return Array.from(groups.entries()).map(([date, items]) => ({
    date,
    label: format(new Date(items[0].pubDate), "M月d日", { locale: zhCN }),
    items,
  }));
}

export default function HomeClient({ user, allItems, hotTopics }: HomeClientProps) {
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<"home" | "favorites">("home");
  const [mobileNav, setMobileNav] = useState(false);
  const [favLoaded, setFavLoaded] = useState(false);

  // Load favorites from Supabase for logged-in users
  useEffect(() => {
    if (!user) { setFavLoaded(true); return; }
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (data.ids) setFavorites(new Set(data.ids));
      })
      .catch((err) => console.warn("[Favorites] Load failed:", err))
      .finally(() => setFavLoaded(true));
  }, [user]);

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (category !== "all") items = items.filter((i) => i.source.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i) =>
        i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return items;
  }, [allItems, category, searchQuery]);

  const filteredHotTopics = useMemo(() => {
    if (category !== "all" || searchQuery) return [];
    return hotTopics;
  }, [category, searchQuery, hotTopics]);

  const favoriteItems = useMemo(() => allItems.filter((i) => favorites.has(i.id)), [allItems, favorites]);
  const dateGroups = useMemo(() => groupByDate(filteredItems), [filteredItems]);

  const handleFavorite = async (item: FeedItem) => {
    if (!user) return;

    const willFav = !favorites.has(item.id);

    // Optimistic UI update
    setFavorites((prev) => {
      const next = new Set(prev);
      if (willFav) next.add(item.id); else next.delete(item.id);
      return next;
    });

    try {
      const res = await fetch("/api/favorites", {
        method: willFav ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, title: item.title }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[Favorites] API error:", res.status, err);
        // Revert
        setFavorites((prev) => {
          const next = new Set(prev);
          if (willFav) next.delete(item.id); else next.add(item.id);
          return next;
        });
        alert("收藏失败: " + (err.error || res.status));
      }
    } catch (e) {
      console.error("[Favorites] Network error:", e);
      // Revert
      setFavorites((prev) => {
        const next = new Set(prev);
        if (willFav) next.delete(item.id); else next.add(item.id);
        return next;
      });
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar user={user} currentView={currentView} onViewChange={(v) => { setCurrentView(v); setMobileNav(false); }} />

      {/* Main scrollable area */}
      <div className="app-body">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-3 py-2 flex items-center gap-2">
          <button onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm flex items-center gap-1"><TrendingUp className="w-4 h-4 text-accent" /> AI Radar</span>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
            <input type="text" placeholder="搜索…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-6 pr-2 py-1 rounded-md bg-tag-bg text-xs w-28 focus:outline-none focus:ring-1 focus:ring-accent/30" />
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileNav && (
          <div className="md:hidden fixed inset-0 top-[41px] z-20" onClick={() => setMobileNav(false)}>
            <div className="bg-card w-52 h-full shadow-lg p-3" onClick={(e) => e.stopPropagation()}>
              <Sidebar user={user} currentView={currentView} onViewChange={(v) => { setCurrentView(v); setMobileNav(false); }} />
            </div>
          </div>
        )}

        {/* Content — NO max-width centering, just padding */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {currentView === "favorites" && user ? (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold">我的收藏</h2>
                <span className="text-xs text-text-muted">{favoriteItems.length} 条</span>
              </div>
              {favoriteItems.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                  <span className="text-3xl block mb-3">📌</span>
                  <p className="text-sm text-text-muted">还没有收藏</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteItems.map((item) => <FeedCard key={item.id} item={item} isLoggedIn showTime={false} isFavorited onFavorite={handleFavorite} />)}
                </div>
              )}
            </section>
          ) : (
            <>
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-[15px] font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-accent" /> 精选
                    </h2>
                    <p className="text-[11px] text-text-muted mt-0.5">AI 聚合热点 · {allItems.length} 条动态</p>
                  </div>
                  <button onClick={() => { setRefreshing(true); setTimeout(() => window.location.reload(), 300); }} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary">
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <CategoryFilter selected={category} onChange={setCategory} />
                  <div className="hidden sm:block flex-1" />
                  <div className="hidden sm:block sm:relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                    <input type="text" placeholder="搜索标题/摘要…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-6 pr-2 py-1 rounded-lg bg-tag-bg text-xs focus:outline-none focus:ring-1 focus:ring-accent/30 w-44" />
                  </div>
                </div>
              </div>

              {/* Hot topics */}
              {filteredHotTopics.length > 0 && (
                <section className="mb-5">
                  <div className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-border">
                      <span className="text-sm">🔥</span>
                      <span className="text-xs font-semibold">当前热点</span>
                      <span className="text-[10px] text-text-muted">多信源热度 · 随时间消退</span>
                    </div>
                    <div className="divide-y divide-border">
                      {filteredHotTopics.map((topic, idx) => <HotTopicCard key={topic[0].id} rank={idx + 1} items={topic} />)}
                    </div>
                  </div>
                </section>
              )}

              {/* Timeline */}
              <section>
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-card rounded-2xl border border-border">
                    <span className="text-3xl block mb-3">🔍</span>
                    <p className="text-sm text-text-muted">没有找到相关内容</p>
                  </div>
                ) : (
                  dateGroups.map((group) => (
                    <div key={group.date} className="mb-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[11px] font-medium text-text-muted shrink-0">{group.label}</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="space-y-3">
                        {group.items.slice(0, 20).map((item) => (
                          <FeedCard key={item.id} item={item} isLoggedIn={!!user} isFavorited={favorites.has(item.id)} onFavorite={handleFavorite} showTime />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </section>

              <footer className="mt-6 py-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-accent" /> AI Radar</span>
                <span>8 个信源 · 每 30 分钟更新</span>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
