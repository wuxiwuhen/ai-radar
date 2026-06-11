"use client";

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { id: "all", name: "全部", icon: "🌐" },
  { id: "官方博客", name: "官方博客", icon: "🏢" },
  { id: "科技媒体", name: "科技媒体", icon: "📰" },
  { id: "论文研究", name: "论文研究", icon: "📄" },
  { id: "开发者", name: "开发者", icon: "👨‍💻" },
  { id: "中文媒体", name: "中文", icon: "🇨🇳" },
  { id: "社区", name: "社区", icon: "👥" },
  { id: "观点评论", name: "观点", icon: "💡" },
];

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
            selected === cat.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <span>{cat.icon}</span>
          {cat.name}
        </button>
      ))}
    </div>
  );
}
