import { useState, useMemo, useEffect } from 'react';
import type { Story } from '../types/story';
import { demoStories } from '../data/demo-stories';
import StoryCard from '../components/StoryCard';
import TrendPanel from '../components/TrendPanel';
import ParticleField from '../components/ParticleField';
import HeadlineTicker from '../components/HeadlineTicker';

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
        // Handle both new envelope format and legacy flat array
        if (Array.isArray(data)) {
          setStories(data.length > 0 ? data : demoStories);
        } else if (data && Array.isArray(data.stories)) {
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

  return { stories, clusters, featured, loading };
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

export default function Home() {
  const { stories, clusters, featured, loading } = useStories();
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
      <ParticleField />
      <div className="snl-root">
        <header className="masthead">
          <div className="masthead-inner">
            <div className="masthead-top">
              <span className="edition-label">{dateStr}</span>
              <div className="wordmark">
                <img src="/logo.png" alt="Supernova Labs" className="wordmark-logo" />
                <span className="wordmark-primary">SUPERNOVA</span>
                <span className="wordmark-sub">SIGNAL</span>
              </div>
              <span className="edition-label">{stories.length} stories</span>
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

        {/* Rolling headline ticker — today's Mastodon winners */}
        {featured.length > 0 && <HeadlineTicker stories={featured} />}

        <main className="shell">
          {loading ? (
            <div className="skel-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skel" style={{ animationDelay: `${i * 0.07}s` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <p>No stories match.</p>
              <button onClick={() => { setActiveTag(null); setSearch(''); }}>Clear filters</button>
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
                    <TrendPanel clusters={clusters} />
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
  --bg:#08090d; --s1:#0d0f15; --s2:#13161e; --s3:#191c26;
  --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.13);
  --text:#e2e6f3; --text2:#9aa0b4; --text3:#555b6e;
  --accent:#4f8ef7; --accent2:#c84a0c;
  --fh:'Playfair Display',Georgia,serif;
  --fb:'IBM Plex Sans',system-ui,sans-serif;
  --fm:'IBM Plex Mono',monospace;
}
body { background:var(--bg); color:var(--text); font-family:var(--fb); font-size:16px; }
.snl-root { position:relative; z-index:1; min-height:100vh; }

.masthead { position:sticky; top:0; z-index:50; background:rgba(8,9,13,0.92); backdrop-filter:blur(24px) saturate(1.6); border-bottom:1px solid var(--border2); }
.masthead-inner { max-width:1440px; margin:0 auto; padding:0 24px; }
.masthead-top { display:flex; align-items:center; justify-content:space-between; padding:16px 0 12px; gap:16px; }
.wordmark { display:flex; flex-direction:column; align-items:center; gap:3px; }
.wordmark-logo { width:32px; height:32px; object-fit:contain; margin-bottom:1px; }
.wordmark-primary { font-family:var(--fh); font-size:30px; font-weight:900; letter-spacing:0.22em; background:linear-gradient(115deg,#e2e6f3 0%,#6baee8 45%,#c84a0c 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; }
.wordmark-sub { font-family:var(--fm); font-size:10px; font-weight:500; letter-spacing:0.44em; color:var(--text3); text-transform:uppercase; }
.edition-label { font-family:var(--fm); font-size:12px; color:var(--text3); letter-spacing:0.02em; white-space:nowrap; }
.rule { height:1px; background:linear-gradient(90deg,transparent,var(--border2) 15%,var(--border2) 85%,transparent); }
.tag-nav { display:flex; align-items:center; gap:4px; padding:9px 0; overflow-x:auto; scrollbar-width:none; }
.tag-nav::-webkit-scrollbar { display:none; }
.tag-pill { padding:4px 11px; border:1px solid var(--border); border-radius:2px; background:transparent; color:var(--text3); font-family:var(--fm); font-size:11.5px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; cursor:pointer; white-space:nowrap; transition:color 0.12s,border-color 0.12s,background 0.12s; }
.tag-pill:hover { color:var(--text); border-color:var(--border2); }
.tag-pill.active { background:var(--accent); border-color:var(--accent); color:#fff; }
.tag-pill.active-tag { background:color-mix(in srgb,var(--tc) 18%,transparent); border-color:color-mix(in srgb,var(--tc) 50%,transparent); color:var(--tc); }
.pill-count { opacity:0.5; margin-left:5px; font-size:10px; }
.search-wrap { margin-left:auto; flex-shrink:0; }
.search-input { width:180px; padding:4px 12px; border:1px solid var(--border); border-radius:2px; background:var(--s1); color:var(--text); font-family:var(--fm); font-size:12px; outline:none; transition:border-color 0.15s; }
.search-input::placeholder { color:var(--text3); }
.search-input:focus { border-color:var(--accent); }

.shell { max-width:1440px; margin:0 auto; padding:28px 24px 80px; }
.front { display:grid; grid-template-columns:1fr 308px; gap:20px; margin-bottom:36px; align-items:start; }
@media(max-width:1080px){.front{grid-template-columns:1fr}.sidebar{display:none}}
.hero-col { display:flex; flex-direction:column; gap:14px; }
.sec-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
@media(max-width:600px){.sec-row{grid-template-columns:1fr}}
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px; }

.skel-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px; }
@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
.skel { height:180px; border-radius:3px; background:linear-gradient(90deg,var(--s1) 25%,var(--s2) 50%,var(--s1) 75%); background-size:1200px 100%; animation:shimmer 1.8s ease-in-out infinite; }

.empty { text-align:center; padding:100px 0; color:var(--text3); font-size:16px; }
.empty button { margin-top:14px; padding:7px 20px; background:transparent; border:1px solid var(--border2); border-radius:2px; color:var(--text2); font-family:var(--fm); font-size:12px; cursor:pointer; }

.foot { border-top:1px solid var(--border); background:var(--s1); }
.foot-inner { max-width:1440px; margin:0 auto; padding:20px 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
.foot-brand { font-family:var(--fh); font-size:15px; font-weight:700; letter-spacing:0.05em; }
.foot-note { font-family:var(--fm); font-size:11px; color:var(--text3); }
`;
