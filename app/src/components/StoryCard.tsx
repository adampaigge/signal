import type { Story } from '../types/story';
import { TAG_LABELS, TAG_COLORS } from '../pages/Home';

interface Props {
  story: Story;
  onTagClick: (tag: string) => void;
  variant?: 'hero' | 'secondary' | 'card';
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return ''; }
}

export default function StoryCard({ story, onTagClick, variant = 'card' }: Props) {
  const color = (story as any).color || TAG_COLORS[story.tag] || '#4f8ef7';
  const label = TAG_LABELS[story.tag] || story.tag;
  const ago = timeAgo(story.fetched_at);
  const body = (story.summary && story.summary.trim()) ? story.summary : story.excerpt;

  if (variant === 'hero') {
    return (
      <>
        <style>{CARD_STYLES}</style>
        <article className="card-hero">
          <div className="hero-accent" style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)` }} />
          <div className="hero-bar" style={{ background: color }} />
          <div className="hero-body">
            <div className="card-meta">
              <button className="tag-badge" style={{ '--c': color } as React.CSSProperties} onClick={() => onTagClick(story.tag)}>
                {(story as any).emoji || '●'} {label}
              </button>
              <span className="card-source">{story.source}</span>
              <span className="card-time">{ago}</span>
            </div>
            <h1 className="hero-title">
              <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
            </h1>
            {body && <p className="hero-excerpt">{body.slice(0, 280)}{body.length > 280 ? '…' : ''}</p>}
            <a className="read-link" href={story.url} target="_blank" rel="noopener noreferrer">
              Read story →
            </a>
          </div>
        </article>
      </>
    );
  }

  if (variant === 'secondary') {
    return (
      <>
        <style>{CARD_STYLES}</style>
        <article className="card-sec">
          <div className="sec-bar" style={{ background: color }} />
          <div className="sec-body">
            <div className="card-meta">
              <button className="tag-badge sm" style={{ '--c': color } as React.CSSProperties} onClick={() => onTagClick(story.tag)}>
                {label}
              </button>
              <span className="card-time">{ago}</span>
            </div>
            <h2 className="sec-title">
              <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
            </h2>
            {body && <p className="sec-excerpt">{body.slice(0, 140)}{body.length > 140 ? '…' : ''}</p>}
            <span className="card-source sm">{story.source}</span>
          </div>
        </article>
      </>
    );
  }

  // card variant
  return (
    <>
      <style>{CARD_STYLES}</style>
      <article className="card">
        <div className="card-top-bar" style={{ background: color }} />
        <div className="card-inner">
          <div className="card-meta">
            <button className="tag-badge sm" style={{ '--c': color } as React.CSSProperties} onClick={() => onTagClick(story.tag)}>
              {label}
            </button>
            <span className="card-time">{ago}</span>
          </div>
          <h3 className="card-title">
            <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
          </h3>
          {body && <p className="card-excerpt">{body.slice(0, 160)}{body.length > 160 ? '…' : ''}</p>}
          <div className="card-footer">
            <span className="card-source sm">{story.source}</span>
            <a className="card-arrow" href={story.url} target="_blank" rel="noopener noreferrer">→</a>
          </div>
        </div>
      </article>
    </>
  );
}

const CARD_STYLES = `
/* Hero */
.card-hero {
  position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 3px;
  background: #0f1117;
  transition: border-color 0.2s;
}
.card-hero:hover { border-color: rgba(255,255,255,0.16); }
.hero-accent {
  position: absolute; inset: 0; pointer-events: none;
  border-radius: 3px;
}
.hero-bar { width: 3px; position: absolute; left: 0; top: 0; bottom: 0; }
.hero-body { padding: 28px 28px 28px 34px; position: relative; }
.hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(22px, 2.8vw, 34px);
  font-weight: 900; line-height: 1.18;
  letter-spacing: -0.01em;
  margin: 10px 0 14px;
}
.hero-title a { color: #dde1ec; text-decoration: none; transition: color 0.15s; }
.hero-title a:hover { color: #fff; }
.hero-excerpt {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 15px; line-height: 1.65;
  color: #8a8f9e; max-width: 72ch;
  margin-bottom: 20px;
}
.read-link {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px; letter-spacing: 0.05em;
  color: var(--accent, #4f8ef7);
  text-decoration: none; font-weight: 500;
  transition: opacity 0.15s;
}
.read-link:hover { opacity: 0.75; }

/* Secondary */
.card-sec {
  position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 3px; background: #0f1117;
  transition: border-color 0.2s, background 0.2s;
  display: flex; flex-direction: column;
}
.card-sec:hover { border-color: rgba(255,255,255,0.14); background: #13161d; }
.sec-bar { height: 2px; width: 100%; flex-shrink: 0; }
.sec-body { padding: 18px 18px 20px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sec-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 17px; font-weight: 700;
  line-height: 1.3; letter-spacing: -0.005em;
}
.sec-title a { color: #dde1ec; text-decoration: none; transition: color 0.15s; }
.sec-title a:hover { color: #fff; }
.sec-excerpt {
  font-size: 13px; line-height: 1.6; color: #767c8e; flex: 1;
}

/* Regular card */
.card {
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 3px; background: #0f1117;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.card:hover {
  border-color: rgba(255,255,255,0.12);
  background: #121519;
  transform: translateY(-1px);
}
.card-top-bar { height: 2px; width: 100%; }
.card-inner { padding: 16px 16px 14px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.card-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14.5px; font-weight: 600;
  line-height: 1.4; letter-spacing: -0.005em;
}
.card-title a { color: #cdd1de; text-decoration: none; transition: color 0.15s; }
.card-title a:hover { color: #fff; }
.card-excerpt {
  font-size: 12.5px; line-height: 1.6; color: #666c7e; flex: 1;
}
.card-footer {
  display: flex; align-items: center;
  justify-content: space-between; gap: 8px;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.card-arrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px; color: #4a5063;
  text-decoration: none; transition: color 0.15s;
}
.card-arrow:hover { color: #4f8ef7; }

/* Shared */
.card-meta {
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
}
.tag-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 2px;
  border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
  background: color-mix(in srgb, var(--c) 12%, transparent);
  color: var(--c);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; font-weight: 500;
  letter-spacing: 0.07em; text-transform: uppercase;
  cursor: pointer; transition: opacity 0.15s;
}
.tag-badge:hover { opacity: 0.8; }
.tag-badge.sm { font-size: 9.5px; padding: 1.5px 7px; }

.card-source {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px; color: #4a5063; letter-spacing: 0.02em;
}
.card-source.sm { font-size: 10px; }
.card-time {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; color: #3d4254;
  margin-left: auto;
}
`;
