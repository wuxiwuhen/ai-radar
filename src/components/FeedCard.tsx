"use client";

import { useState } from "react";
import { Heart, ExternalLink, Lock } from "lucide-react";
import { FeedItem } from "@/lib/types";

interface FeedCardProps {
  item: FeedItem;
  isLoggedIn: boolean;
  isFavorited?: boolean;
  onFavorite?: (item: FeedItem) => void;
  showTime?: boolean;
}

export default function FeedCard({
  item,
  isLoggedIn,
  isFavorited,
  onFavorite,
  showTime = true,
}: FeedCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Extract time display
  const timeDisplay = (() => {
    try {
      const d = new Date(item.pubDate);
      const h = d.getHours().toString().padStart(2, "0");
      const m = d.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    } catch {
      return "";
    }
  })();

  const isLong = item.description.length > 120;
  const shortDesc = isLong ? item.description.slice(0, 120) + "…" : item.description;

  return (
    <div className="flex gap-4 group">
      {/* Timeline left column: time + line */}
      {showTime && (
        <div className="shrink-0 w-12 flex flex-col items-center pt-0.5">
          <span className="text-[11px] text-text-muted font-mono">{timeDisplay}</span>
        </div>
      )}

      {/* Timeline right column: content */}
      <div className="flex-1 min-w-0 pb-1">
        <article className="bg-card rounded-2xl border border-border p-3.5 hover:border-[rgba(15,23,42,0.15)] transition-colors">
          {/* Head */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-text-muted">
              <span className="text-sm">{item.source.icon}</span>
              <span className="text-[11px]">{item.source.name}</span>
            </div>
            <span className="text-[10.5px] font-extrabold text-score tracking-tight">
              {item.heatScore}
            </span>
          </div>

          {/* Title */}
          {item.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[15px] font-bold leading-snug text-text-primary hover:text-accent transition-colors mb-1.5"
            >
              {item.title}
            </a>
          ) : (
            <h3 className="text-[15px] font-bold leading-snug text-text-primary mb-1.5">
              {item.title}
            </h3>
          )}

          {/* Summary */}
          {item.description && (
            <p className="text-[12.5px] leading-5 text-text-secondary">
              {expanded ? item.description : shortDesc}
              {isLong && (
                <button onClick={() => setExpanded(!expanded)} className="text-accent hover:underline ml-0.5">
                  {expanded ? "收起" : "展开"}
                </button>
              )}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-tag-bg text-tag-text">
                {tag}
              </span>
            ))}
          </div>

          {/* Divider + Source info */}
          <hr className="border-border my-2.5" />
          <div className="rounded-lg bg-reason-bg px-2.5 py-1.5">
            <span className="text-[11px] font-medium text-reason-text">来源：</span>
            <span className="text-[12px] text-reason-text leading-relaxed">
              {item.source.icon} {item.source.name}
              {item.description ? ` — ${item.description.slice(0, 80)}${item.description.length > 80 ? "…" : ""}` : ""}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-2.5">
            {isLoggedIn ? (
              <button
                onClick={() => onFavorite?.(item)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-colors ${
                  isFavorited ? "text-red-500" : "text-text-muted hover:text-red-400"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "已收藏" : "收藏"}
              </button>
            ) : (
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <Lock className="w-3 h-3" /> 登录后可收藏
              </span>
            )}
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-text-muted hover:text-accent flex items-center gap-0.5">
                原文 <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
