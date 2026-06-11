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
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      {/* Rank */}
      <div
        className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-extrabold mt-0.5 ${
          rank <= 3
            ? "bg-amber-100 text-amber-700"
            : "bg-tag-bg text-text-muted"
        }`}
      >
        {rank}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-text-primary leading-snug line-clamp-1">
          {main.link ? (
            <a href={main.link} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              {main.title}
            </a>
          ) : (
            main.title
          )}
        </h4>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-[11px] text-accent font-medium">
            {sourceCount} 个信源
          </span>
          <span className="text-[10px] text-text-muted opacity-40">·</span>
          <span className="text-[11px] text-text-muted">{timeAgo}</span>
        </div>

        {/* Source chips */}
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {items.slice(0, 4).map((item) => (
            <span
              key={item.source.id}
              className="text-[10px] bg-tag-bg text-tag-text px-1.5 py-0.5 rounded"
            >
              {item.source.icon} {item.source.name}
            </span>
          ))}
          {sourceCount > 4 && (
            <span className="text-[10px] text-text-muted">+{sourceCount - 4}</span>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="shrink-0">
        <span className="text-[11px] font-extrabold text-score">{maxScore}</span>
      </div>
    </div>
  );
}
