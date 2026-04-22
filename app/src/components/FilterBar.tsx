import { TAG_LABELS, TAG_COLORS } from '../types/story';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterBarProps {
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  storyCounts: Record<string, number>;
}

const ALL_TAGS = Object.keys(TAG_LABELS);

export default function FilterBar({ activeTag, onTagChange, storyCounts }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="font-mono uppercase tracking-wider">Filter</span>
      </div>

      <button
        onClick={() => onTagChange(null)}
        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
          activeTag === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'
        }`}
      >
        All
        <span className="ml-1.5 font-mono opacity-60">
          {Object.values(storyCounts).reduce((a, b) => a + b, 0)}
        </span>
      </button>

      {ALL_TAGS.map((tag) => {
        const count = storyCounts[tag] || 0;
        if (count === 0) return null;
        const isActive = activeTag === tag;
        const color = TAG_COLORS[tag] || '#64748b';

        return (
          <button
            key={tag}
            onClick={() => onTagChange(isActive ? null : tag)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? 'text-white'
                : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'
            }`}
            style={
              isActive
                ? { backgroundColor: color }
                : undefined
            }
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isActive ? '#fff' : color }}
            />
            {TAG_LABELS[tag]}
            <span className="font-mono opacity-60">{count}</span>
          </button>
        );
      })}

      {activeTag && (
        <button
          onClick={() => onTagChange(null)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
