import { useState, useMemo, useEffect } from 'react';
import type { Story } from '../types/story';
import { demoStories } from '../data/demo-stories';
import StoryCard from '../components/StoryCard';
import TrendPanel from '../components/TrendPanel';

function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/stories.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Story[]) => {
        setStories(Array.isArray(data) && data.length > 0 ? data : demoStories);
      })
      .catch(() => setStories(demoStories))
      .finally(() => setLoading(false));
  }, []);

  return { stories, loading };
}

export const TAG_LABELS: Record<string, string> = {
  space: 'Space', lunar: 'Lunar', ai: 'AI', robotics: 'Robotics',
  drones: 'Drones', '3dprint': '3D Print', futurology: 'Futures',
  tech: 'Tech', youtube: 'Video',
};

export const TAG_COLORS: Record<string, string> = {
  space: '#4f8ef7', lunar: '#a78bfa', ai: '#34d399', robotics: '#fbbf24',
  drones: '#22d3ee', '3dprint': '#f472b6', futurology: '#fb923c',
  tech: '#9f7aea', youtube: '#f87171',
};

export default function Home() {
  const { stories, loading } = useStories();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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
      <div className="snl-root">
        {/* Masthead */}
        <header className="masthead">
          <div className="masthead-inner">
            <div className="masthead-top">
              <span className="edition-label">{dateStr}</span>
              <div className="wordmark">
                <span className="wordmark-primary">SUPERNOVA</span>
                <span className="wordmark-sub">SIGNAL</span>
              </div>
              <span className="edition-label">{stories.length} stories indexed</span>
            </div>
            <div className="rule" />
            <nav className="tag-nav">
              <button
                className={`tag-pill ${!activeTag ? 'active' : ''}`}
                onClick={() => setActiveTag(null)}
              >
                All <span className="pill-count">{stories.length}</span>
              </button>
              {Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => (
                  <button
                    key={tag}
                    className={`tag-pill ${activeTag === tag ? 'active-tag' : ''}`}
                    style={{ '--tc': TAG_COLORS[tag] || '#64748b' } as React.CSSProperties}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  >
                    {TAG_LABELS[tag] || tag}
                    <span className="pill-count">{count}</span>
                  </button>
                ))}
              <div className="search-wrap">
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </nav>
          </div>
        </header>

        {/* Content */}
        <main className="shell">
          {loading ? (
            <div className="skel-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skel" style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <p>No stories match.</p>
              <button onClick={() => { setActiveTag(null); setSearch(''); }}>Clear</button>
            </div>
          ) : (
            <>
              {!activeTag && !search && hero && (
                <section className="front">
                  <div className="hero-col">
                    <StoryCard story={hero} onTagClick={setActiveTag} variant="hero" />
                    <div className="sec-row">
                      {secondary.map(s => (
                        <StoryCard key={s.story_id} story={s} onTagClick={setActiveTag} variant="secondary" />
                      ))}
                    </div>
                  </div>
                  <aside className="sidebar">
                    <TrendPanel stories={stories} />
                  </aside>
                </section>
              )}
              <section className="grid">
                {(activeTag || search ? filtered : grid).map(s => (
                  <StoryCard key={s.story_id} story={s} onTagClick={setActiveTag} variant="card" />
                ))}
              </section>
            </>
          )}
        </main>

        <footer className="foot">
          <div className="foot-inner">
            <span className="foot-brand">Supernova Labs · Signal</span>
            <span className="foot-note">Built with love and determination, not by VC</span>
          </div>
        </footer>
      </div>
    </>
  );
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

:root {
  --bg:       #08090d;
  --s1:       #0f1117;
  --s2:       #161920;
  --s3:       #1d2029;
  --border:   rgba(255,255,255,0.06);
  --border2:  rgba(255,255,255,0.11);
  --text:     #dde1ec;
  --text2:    #9499ab;
  --text3:    #5e6372;
  --accent:   #4f8ef7;
  --accent2:  #c84a0c;
  --fh: 'Playfair Display', Georgia, serif;
  --fb: 'IBM Plex Sans', system-ui, sans-serif;
  --fm: 'IBM Plex Mono', monospace;
}

body { background: var(--bg); color: var(--text); font-family: var(--fb); }

.snl-root { min-height: 100vh; }

/* ── Masthead ─────────────────────────────────────────────── */
.masthead {
  position: sticky; top: 0; z-index: 50;
  background: rgba(8,9,13,0.95);
  backdrop-filter: blur(20px) saturate(1.4);
  border-bottom: 1px solid var(--border2);
}
.masthead-inner { max-width: 1440px; margin: 0 auto; padding: 0 28px; }
.masthead-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0 10px;
}
.wordmark { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.wordmark-primary {
  font-family: var(--fh);
  font-size: 26px; font-weight: 900; letter-spacing: 0.2em;
  background: linear-gradient(120deg, #dde1ec 0%, #4f8ef7 60%, #c84a0c 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.wordmark-sub {
  font-family: var(--fm); font-size: 9px; font-weight: 500;
  letter-spacing: 0.42em; color: var(--text3); text-transform: uppercase;
}
.edition-label {
  font-family: var(--fm); font-size: 10.5px;
  color: var(--text3); letter-spacing: 0.03em;
  white-space: nowrap;
}
.rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border2) 15%, var(--border2) 85%, transparent);
}
.tag-nav {
  display: flex; align-items: center; gap: 3px;
  padding: 8px 0; overflow-x: auto; scrollbar-width: none;
}
.tag-nav::-webkit-scrollbar { display: none; }

.tag-pill {
  padding: 3px 9px;
  border: 1px solid var(--border);
  border-radius: 2px;
  background: transparent;
  color: var(--text3);
  font-family: var(--fm); font-size: 10.5px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; white-space: nowrap;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
}
.tag-pill:hover { color: var(--text); border-color: var(--border2); }
.tag-pill.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.tag-pill.active-tag {
  background: color-mix(in srgb, var(--tc) 18%, transparent);
  border-color: color-mix(in srgb, var(--tc) 50%, transparent);
  color: var(--tc);
}
.pill-count { opacity: 0.55; margin-left: 4px; font-size: 9.5px; }

.search-wrap { margin-left: auto; flex-shrink: 0; }
.search-input {
  width: 170px; padding: 3px 10px;
  border: 1px solid var(--border); border-radius: 2px;
  background: var(--s1); color: var(--text);
  font-family: var(--fm); font-size: 11px;
  outline: none; transition: border-color 0.15s;
}
.search-input::placeholder { color: var(--text3); }
.search-input:focus { border-color: var(--accent); }

/* ── Shell ─────────────────────────────────────────────────── */
.shell { max-width: 1440px; margin: 0 auto; padding: 32px 28px 80px; }

.front {
  display: grid;
  grid-template-columns: 1fr 296px;
  gap: 24px;
  margin-bottom: 40px;
  align-items: start;
}
@media (max-width: 1100px) { .front { grid-template-columns: 1fr; } .sidebar { display: none; } }

.hero-col { display: flex; flex-direction: column; gap: 16px; }
.sec-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .sec-row { grid-template-columns: 1fr; } }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
  gap: 14px;
}

/* ── Skeletons ──────────────────────────────────────────────── */
.skel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
  gap: 14px;
}
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
.skel {
  height: 170px; border-radius: 3px;
  background: linear-gradient(90deg, var(--s1) 25%, var(--s2) 50%, var(--s1) 75%);
  background-size: 1200px 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

/* ── Empty ──────────────────────────────────────────────────── */
.empty { text-align: center; padding: 100px 0; color: var(--text3); }
.empty button {
  margin-top: 12px; padding: 6px 18px;
  background: transparent; border: 1px solid var(--border2);
  border-radius: 2px; color: var(--text2);
  font-family: var(--fm); font-size: 11px; cursor: pointer;
}

/* ── Footer ─────────────────────────────────────────────────── */
.foot { border-top: 1px solid var(--border); background: var(--s1); }
.foot-inner {
  max-width: 1440px; margin: 0 auto;
  padding: 18px 28px;
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 8px;
}
.foot-brand {
  font-family: var(--fh); font-size: 13px; font-weight: 700;
  letter-spacing: 0.05em;
}
.foot-note { font-family: var(--fm); font-size: 10.5px; color: var(--text3); }
`;
