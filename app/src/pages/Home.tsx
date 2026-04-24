import { useState, useMemo, useEffect, useRef } from 'react';
import type { Story } from '../types/story';
import { demoStories } from '../data/demo-stories';
import StoryCard from '../components/StoryCard';
import TrendPanel from '../components/TrendPanel';
import ParticleField from '../components/ParticleField';
import HeadlineTicker from '../components/HeadlineTicker';
import PhysicsTitle from '../components/PhysicsTitle';

interface StoriesPayload {
  stories: Story[];
  clusters: ClusterData[];
  featured: Story[];
  exported_at: string;
}

export interface ClusterData {
  cluster_id: string;
  generated_at: string;
  dominant_tags: string[];
  story_count: number;
  observation: string;
  stories: {
    story_id: string; title: string; url: string;
    tag: string; source: string; fetched_at: string; excerpt: string;
  }[];
}

function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [featured, setFeatured] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/stories.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: StoriesPayload | Story[]) => {
        if (Array.isArray(data)) {
          setStories(data.length > 0 ? data : demoStories);
        } else if (data?.stories) {
          setStories(data.stories.length > 0 ? data.stories : demoStories);
          setClusters(data.clusters || []);
          setFeatured(data.featured || []);
        } else {
          setStories(demoStories);
        }
      })
      .catch(() => setStories(demoStories))
      .finally(() => setLoading(false));
  }, []);

  // Fallback: if no featured stories (Mastodon not posting yet),
  // use the first 5 stories that have a summary (bot-selected winners)
  // or just the first 5 stories ordered by recency
  const tickerStories = featured.length > 0
    ? featured
    : stories.filter(s => s.summary && s.summary.trim()).slice(0, 5);

  return { stories, clusters, featured: tickerStories, loading };
}

export const TAG_LABELS: Record<string, string> = {
  space: 'Space', lunar: 'Lunar', ai: 'AI', robotics: 'Robotics',
  drones: 'Drones', '3dprint': '3D Print', futurology: 'Futures',
  tech: 'Tech', youtube: 'Video', tiktok: 'TikTok', xr: 'XR',
};

export const TAG_COLORS: Record<string, string> = {
  space: '#4f8ef7', lunar: '#a78bfa', ai: '#34d399', robotics: '#fbbf24',
  drones: '#22d3ee', '3dprint': '#f472b6', futurology: '#fb923c',
  tech: '#9f7aea', youtube: '#f87171', tiktok: '#69C9D0', xr: '#7c3aed',
};

// Single accent for unified feel — tag colors only on dots/hovers
export const ACCENT = '#e8611a'; // Supernova orange from logo

export default function Home() {
  const { stories, clusters, featured, loading } = useStories();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const headerRef = useRef<HTMLElement>(null);

  const tagCounts = useMemo(() => {
    const c: Record<string, number> = {};
    stories.forEach(s => { c[s.tag] = (c[s.tag] || 0) + 1; });
    return c;
  }, [stories]);

  const filtered = useMemo(() => {
    let r = stories;
    if (activeTag) r = r.filter(s => s.tag === activeTag);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.summary || s.excerpt || '').toLowerCase().includes(q)
      );
    }
    return r;
  }, [stories, activeTag, search]);

  const hero = filtered[0];
  const secondary = filtered.slice(1, 3);
  const grid = filtered.slice(3);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <style>{STYLES}</style>
      <ParticleField />

      <div className="snl-root">
        {/* Physics title overlay — outside masthead stacking context */}
        <div className="physics-overlay">
          <PhysicsTitle text="THE SIGNAL" fontSize={38} restY={70} />
        </div>
        {/* ── Masthead ──────────────────────────────────────── */}
        <header ref={headerRef} className="masthead">
          <div className="mast-inner">

            <div className="mast-top">
              <div className="mast-left">
                <img src="/logo.png" alt="" className="mast-logo" />
                <div className="mast-id">
                  <span className="mast-org">SUPERNOVA LABS</span>
                  <span className="mast-date">{dateStr}</span>
                </div>
              </div>
              <div className="mast-title-placeholder" aria-hidden="true">THE SIGNAL</div>
              <span className="mast-count">{stories.length}&thinsp;stories</span>
            </div>

            <div className="mast-rule" />

            {/* Tag rail — underline style, not pills */}
            <nav className="tag-rail">
              <button
                className={`rail-item ${!activeTag ? 'rail-active' : ''}`}
                onClick={() => setActiveTag(null)}
              >
                All <sup className="rail-sup">{stories.length}</sup>
              </button>
              {Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => (
                  <button
                    key={tag}
                    className={`rail-item ${activeTag === tag ? 'rail-active' : ''}`}
                    style={{ '--dot': TAG_COLORS[tag] || ACCENT } as React.CSSProperties}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  >
                    <span className="rail-dot" />
                    {TAG_LABELS[tag] || tag}
                    <sup className="rail-sup">{count}</sup>
                  </button>
                ))}
              <div className="rail-search">
                <input
                  className="search-field"
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </nav>
          </div>
        </header>

        {/* ── Ticker ────────────────────────────────────────── */}
        {featured.length > 0 && <HeadlineTicker stories={featured} />}

        {/* ── Body ──────────────────────────────────────────── */}
        <main className="body-shell">
          {loading ? (
            <div className="skel-wrap">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skel" style={{ animationDelay: `${i * 0.06}s` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              No stories match.
              <button onClick={() => { setActiveTag(null); setSearch(''); }}>Clear</button>
            </div>
          ) : (
            <>
              {!activeTag && !search && hero && (
                <section className="front-section">
                  <div className="front-main">
                    <StoryCard story={hero} onTagClick={setActiveTag} variant="hero" />
                    <div className="sec-pair">
                      {secondary.map(s => (
                        <StoryCard key={s.story_id} story={s} onTagClick={setActiveTag} variant="secondary" />
                      ))}
                    </div>
                  </div>
                  <aside className="front-aside">
                    <TrendPanel clusters={clusters} />
                  </aside>
                </section>
              )}
              <section className="card-grid">
                {(activeTag || search ? filtered : grid).map((s, i) => (
                  <StoryCard
                    key={s.story_id}
                    story={s}
                    onTagClick={setActiveTag}
                    variant="card"
                    index={i}
                  />
                ))}
              </section>
            </>
          )}
        </main>

        <footer className="site-foot">
          <span className="foot-brand">Supernova Labs · Signal</span>
          <span className="foot-note">Built with love and determination, not by VC</span>
        </footer>
      </div>
    </>
  );
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700;0,6..72,800;1,6..72,400;1,6..72,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

:root {
  --bg:        #07080c;
  --ink:       #e4e7f2;
  --ink2:      #8a90a6;
  --ink3:      #42475a;
  --surface:   #0c0e15;
  --surface2:  #111420;
  --rule:      rgba(255,255,255,0.08);
  --rule2:     rgba(255,255,255,0.13);
  --orange:    #e8611a;
  --blue:      #4f8ef7;
  --fh: 'Newsreader', Georgia, serif;
  --fb: 'DM Sans', system-ui, sans-serif;
  --fm: 'DM Mono', monospace;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--fb);
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.snl-root { position: relative; z-index: 1; min-height: 100vh; }

/* ── Masthead ────────────────────────────────────────────────── */
.masthead {
  position: sticky; top: 0; z-index: 50;
  background: rgba(7,8,12,0.94);
  backdrop-filter: blur(28px) saturate(1.5);
  border-bottom: 1px solid var(--rule2);
  overflow: visible;
  isolation: auto;
}
.mast-inner { max-width: 1480px; margin: 0 auto; padding: 0 28px; overflow: visible; }

.mast-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 0 22px; gap: 20px;
  overflow: visible;
  position: relative;
}

.mast-left {
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.mast-logo {
  width: 40px; height: 40px; object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(232,97,26,0.4));
}
.mast-id {
  display: flex; flex-direction: column; gap: 2px;
}
.mast-org {
  font-family: var(--fm); font-size: 9px; font-weight: 500;
  letter-spacing: 0.28em; color: var(--orange);
  text-transform: uppercase;
}
.mast-title-placeholder {
  font-family: var(--fh); font-size: 38px; font-weight: 800;
  letter-spacing: -0.02em; line-height: 1.05;
  color: transparent; user-select: none; pointer-events: none;
  white-space: nowrap;
  position: absolute; left: 50%; transform: translateX(-50%);
}
.physics-overlay {
  position: fixed; top: 0; left: 0; right: 0;
  height: 180px; pointer-events: none; z-index: 9999;
}
.physics-overlay > * { pointer-events: all; }
.mast-date {
  font-family: var(--fm); font-size: 11px; color: var(--ink3);
  letter-spacing: 0.02em; white-space: nowrap;
}
.mast-count {
  font-family: var(--fm); font-size: 11px; color: var(--ink3);
  white-space: nowrap;
}
.mast-rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--rule2) 12%, var(--rule2) 88%, transparent);
}

/* ── Tag rail ────────────────────────────────────────────────── */
.tag-rail {
  display: flex; align-items: center; gap: 0;
  padding: 6px 0 6px; overflow-x: auto; scrollbar-width: none; border-top: 1px solid var(--rule);
}
.tag-rail::-webkit-scrollbar { display: none; }

.rail-item {
  position: relative;
  display: inline-flex; align-items: center; gap: 5px;
  padding: 13px 14px;
  background: transparent; border: none; border-bottom: 2px solid transparent;
  color: var(--ink3);
  font-family: var(--fm); font-size: 11px; font-weight: 500;
  letter-spacing: 0.07em; text-transform: uppercase;
  cursor: pointer; white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.rail-item:hover { color: var(--ink); }
.rail-item.rail-active {
  color: var(--ink);
  border-bottom-color: var(--orange);
}
.rail-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--dot, var(--orange));
  opacity: 0.5;
  transition: opacity 0.15s;
}
.rail-item:hover .rail-dot,
.rail-item.rail-active .rail-dot { opacity: 1; }
.rail-sup {
  font-size: 8.5px; font-weight: 400;
  color: var(--ink3); vertical-align: super;
  margin-left: 1px;
}
.rail-search { margin-left: auto; flex-shrink: 0; padding: 6px 0; }
.search-field {
  width: 160px; padding: 5px 12px;
  border: 1px solid var(--rule); border-radius: 2px;
  background: var(--surface); color: var(--ink);
  font-family: var(--fm); font-size: 11px;
  outline: none; transition: border-color 0.15s;
}
.search-field::placeholder { color: var(--ink3); }
.search-field:focus { border-color: var(--orange); }

/* ── Layout ──────────────────────────────────────────────────── */
.body-shell {
  max-width: 1480px; margin: 0 auto;
  padding: 32px 28px 80px;
}

.front-section {
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 24px; margin-bottom: 40px; align-items: start;
}
@media (max-width: 1100px) {
  .front-section { grid-template-columns: 1fr; }
  .front-aside { display: none; }
}
.front-main { display: flex; flex-direction: column; gap: 16px; }
.sec-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .sec-pair { grid-template-columns: 1fr; } }

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 14px;
}

/* ── Skeletons ───────────────────────────────────────────────── */
.skel-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 14px;
}
@keyframes shimmer {
  0%   { background-position: -700px 0; }
  100% { background-position: 700px 0; }
}
.skel {
  height: 180px; border-radius: 2px;
  background: linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%);
  background-size: 1400px 100%;
  animation: shimmer 2s ease-in-out infinite;
}

/* ── Empty ───────────────────────────────────────────────────── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 120px 0;
  font-family: var(--fm); font-size: 12px; color: var(--ink3);
}
.empty-state button {
  padding: 6px 18px; background: transparent;
  border: 1px solid var(--rule2); border-radius: 2px;
  color: var(--ink2); font-family: var(--fm); font-size: 11px;
  cursor: pointer; transition: border-color 0.15s, color 0.15s;
}
.empty-state button:hover { border-color: var(--orange); color: var(--orange); }

/* ── Footer ──────────────────────────────────────────────────── */
.site-foot {
  border-top: 1px solid var(--rule);
  background: var(--surface);
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 8px;
  padding: 20px 28px;
  max-width: none;
}
.foot-brand {
  font-family: var(--fh); font-size: 14px; font-weight: 700;
  letter-spacing: 0.04em;
}
.foot-note {
  font-family: var(--fm); font-size: 10px; color: var(--ink3);
}
`;
