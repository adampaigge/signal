import { useState } from 'react';
import type { Story } from '../types/story';
import { ExternalLink, Link2, Clock, Hash } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onTagClick: (tag: string) => void;
  featured?: boolean;
}

export default function StoryCard({ story, onTagClick, featured = false }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const tagLabel = story.tag.charAt(0).toUpperCase() + story.tag.slice(1);
  const timeAgo = getTimeAgo(story.fetched_at);
  // Use AI summary if available, fall back to raw excerpt so cards are never blank
  const displayText = (story.summary && story.summary.trim())
    ? story.summary
    : story.excerpt
      ? story.excerpt.slice(0, 200) + (story.excerpt.length > 200 ? '…' : '')
      : null;

  if (featured) {
    return (
      <article className="group relative flex flex-col sm:flex-row rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-card/80 hover:shadow-2xl hover:shadow-black/30">
        {/* Left accent bar */}
        <div className="h-1 sm:h-auto sm:w-1.5 w-full shrink-0" style={{ backgroundColor: story.color }} />

        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onTagClick(story.tag)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: `${story.color}20`, color: story.color }}
              >
                <span>{story.emoji}</span>
                <span className="uppercase tracking-wider">{tagLabel}</span>
              </button>
              <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">
                Top signal
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono shrink-0">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>

          <h2 className="text-xl font-semibold leading-snug mb-3 group-hover:text-primary transition-colors">
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-2 decoration-primary/40"
            >
              {story.title}
            </a>
          </h2>

          {displayText && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              {displayText}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-white/5">
            <span className="text-xs text-muted-foreground font-mono">{story.source}</span>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Read
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col rounded-xl border border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/10 hover:bg-card/80 hover:shadow-2xl hover:shadow-black/20">
      {/* Color accent bar */}
      <div className="h-0.5 w-full" style={{ backgroundColor: story.color }} />

      <div className="flex flex-1 flex-col p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <button
            onClick={() => onTagClick(story.tag)}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80 shrink-0"
            style={{ backgroundColor: `${story.color}15`, color: story.color }}
          >
            <span>{story.emoji}</span>
            <span className="uppercase tracking-wider">{tagLabel}</span>
          </button>
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono shrink-0">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-2 decoration-primary/40"
          >
            {story.title}
          </a>
        </h3>

        {/* Body text — summary preferred, excerpt as fallback */}
        {displayText && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
            {displayText}
          </p>
        )}

        {/* Source & Actions */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-white/5">
          <span className="text-xs text-muted-foreground font-mono truncate">{story.source}</span>
          <div className="flex items-center gap-1 shrink-0">
            {story.related && story.related.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <Link2 className="w-3 h-3" />
                {story.related.length}
              </button>
            )}
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Related stories */}
        {expanded && story.related && story.related.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono uppercase tracking-wider">
              <Hash className="w-3 h-3" />
              Related
            </div>
            {story.related.map((r) => (
              <a
                key={r.story_id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-1"
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: TAG_COLORS[r.tag] || '#64748b' }}
                />
                {r.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function getTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  } catch {
    return '';
  }
}

const TAG_COLORS: Record<string, string> = {
  space: '#3b82f6',
  lunar: '#8b5cf6',
  ai: '#10b981',
  robotics: '#f59e0b',
  drones: '#06b6d4',
  '3dprint': '#ec4899',
  futurology: '#f97316',
  tech: '#64748b',
  youtube: '#ef4444',
};
