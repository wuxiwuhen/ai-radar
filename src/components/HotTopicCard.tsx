import { FeedItem } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface HotTopicCardProps {
  rank: number;
  items: FeedItem[];
}

export default function HotTopicCard({ rank, items }: HotTopicCardProps) {
  const main = items[0];
  const sourceCount = items.length;
  const maxScore = Math.max(...items.map((i) => i.heatScore));

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(main.pubDate), {
        addSuffix: true,
        locale: zhCN,
      });
    } catch {
      return "";
    }
  })();

  return (
    <div className="flex gap-3 sm:gap-4 py-3">
      {/* Rank */}
      <div
        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${
          rank <= 3
            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {rank}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-snug">
          {main.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-primary font-medium">
            {sourceCount} 个信源
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>

        {/* Source icons (show first 5) */}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {items.slice(0, 5).map((item) => (
            <span
              key={item.source.id}
              className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
            >
              {item.source.icon} {item.source.name}
            </span>
          ))}
          {sourceCount > 5 && (
            <span className="text-xs text-muted-foreground">
              +{sourceCount - 5}
            </span>
          )}
        </div>
      </div>

      {/* Score badge */}
      <div className="shrink-0">
        <span
          className={`text-xs font-bold px-2 py-1 rounded-lg ${
            maxScore >= 80
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : maxScore >= 60
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          ★ {maxScore}
        </span>
      </div>
    </div>
  );
}
