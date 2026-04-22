import { useState, useMemo, useEffect } from 'react';
import type { Story } from '../types/story';
import { demoStories } from '../data/demo-stories';
import HeroSection from '../components/HeroSection';
import FilterBar from '../components/FilterBar';
import StoryCard from '../components/StoryCard';
import TrendSection from '../components/TrendSection';
import { Search, Github, Radio } from 'lucide-react';

// ---------------------------------------------------------------------------
// Data loading — fetches /stories.json at runtime (written by the bot and
// committed to app/public/ via GitHub API). Falls back to demo data if the
// fetch fails or the file doesn't exist yet.
// ---------------------------------------------------------------------------
function useStories() {
  const [stories, setStories] = useState<Story[]>(demoStories);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    let cancelled = false;
    fetch('/stories.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Story[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setStories(data);
          setSource('live');
        }
      })
      .catch(() => {
        // silently fall back to demo data
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { stories, loading, source };
}

const trends = [
  {
    id: 'trend-1',
    text: 'Reusable launch is crossing from experimental to operational across multiple providers simultaneously — Rocket Lab, Stoke, and ISRO all moved the needle this week. The access equation is shifting faster than pricing models can adapt.',
    posted_at: '2025-04-21T16:00:00Z',
    related_tags: ['space', 'lunar'],
  },
  {
    id: 'trend-2',
    text: 'AI capability compression continues: AlphaDev on algorithms, Claude on context length. The pattern is AI expanding into infrastructure layers previously considered stable — sorting, memory, reasoning chains.',
    posted_at: '2025-04-20T14:00:00Z',
    related_tags: ['ai', 'futurology'],
  },
];

export default function Home() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { stories, loading, source } = useStories();

  const storyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    stories.forEach((s) => {
      counts[s.tag] = (counts[s.tag] || 0) + 1;
    });
    return counts;
  }, [stories]);

  const filteredStories = useMemo(() => {
    let result = stories;
    if (activeTag) result = result.filter((s) => s.tag === activeTag);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.summary || s.excerpt).toLowerCase().includes(q) ||
          s.source.toLowerCase().includes(q)
      );
    }
    return result;
  }, [stories, activeTag, searchQuery]);

  // Separate out the top story for a featured card treatment
  const [featuredStory, ...restStories] = filteredStories;

  const uniqueTags = Object.keys(storyCounts).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection storyCount={stories.length} tagCount={uniqueTags} />

      <TrendSection trends={trends} />

      {/* Controls */}
      <section className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <FilterBar
                activeTag={activeTag}
                onTagChange={setActiveTag}
                storyCounts={storyCounts}
              />
            </div>
            <div className="flex items-center gap-3">
              {/* Live/demo indicator */}
              {!loading && (
                <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      source === 'live' ? 'bg-green-500' : 'bg-yellow-500/70'
                    }`}
                  />
                  {source === 'live' ? 'live' : 'demo'}
                </span>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-card/50 h-44 animate-pulse"
              />
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Search className="w-8 h-8 mb-3 opacity-40" />
            <p className="text-sm">No stories match your filters.</p>
            <button
              onClick={() => { setActiveTag(null); setSearchQuery(''); }}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured story — full width, bigger treatment */}
            {featuredStory && !activeTag && !searchQuery && (
              <div className="mb-4">
                <StoryCard
                  story={featuredStory}
                  onTagClick={(tag) => setActiveTag(tag === activeTag ? null : tag)}
                  featured
                />
              </div>
            )}

            {/* Regular grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(activeTag || searchQuery ? filteredStories : restStories).map((story) => (
                <StoryCard
                  key={story.story_id}
                  story={story}
                  onTagClick={(tag) => setActiveTag(tag === activeTag ? null : tag)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Radio className="w-4 h-4 text-primary" />
              <span>
                <span className="font-semibold text-foreground">Supernova Signal</span>
                {' '}— frontier tech intelligence
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <a
                href="https://github.com/supernovalabs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                Source
              </a>
              <span>Bot v7 — Ouroboros</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
