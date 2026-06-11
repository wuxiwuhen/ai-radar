"use client";

import { useState } from "react";
import { Heart, ExternalLink, Clock, Bookmark } from "lucide-react";
import { FeedItem } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface FeedCardProps {
  item: FeedItem;
  isLoggedIn: boolean;
  isFavorited?: boolean;
  onFavorite?: (item: FeedItem) => void;
}

export default function FeedCard({
  item,
  isLoggedIn,
  isFavorited,
  onFavorite,
}: FeedCardProps) {
  const [expanded, setExpanded] = useState(false);

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.pubDate), {
        addSuffix: true,
        locale: zhCN,
      });
    } catch {
      return "";
    }
  })();

  return (
    <article className="group bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/30 transition-colors">
      {/* Header: source + time + score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{item.source.icon}</span>
          <span className="text-sm font-medium text-muted-foreground">
            {item.source.name}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            item.heatScore >= 80
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : item.heatScore >= 60
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          ★ {item.heatScore}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground mb-2 leading-snug line-clamp-2">
        {item.title}
      </h3>

      {/* Description */}
      {item.description && (
        <p
          className={`text-sm text-muted-foreground leading-relaxed ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {item.description}
        </p>
      )}

      {item.description && item.description.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:underline mt-1"
        >
          {expanded ? "收起" : "展开全文"}
        </button>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              onClick={() => onFavorite?.(item)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                isFavorited
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-muted text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${isFavorited ? "fill-current" : ""}`}
              />
              {isFavorited ? "已收藏" : "收藏"}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5" />
              登录后可收藏
            </span>
          )}
        </div>

        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            查看原文
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </article>
  );
}
