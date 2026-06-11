"use client";

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { id: "all", name: "全部" },
  { id: "科技媒体", name: "新闻" },
  { id: "官方博客", name: "官方" },
  { id: "社区", name: "社区" },
  { id: "中文媒体", name: "中文" },
  { id: "开发者", name: "开发" },
];

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-full px-1 py-0.5" style={{ background: "var(--tag-bg)" }}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            selected === cat.id
              ? "bg-accent-bg text-accent-text font-medium"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
