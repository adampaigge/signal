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
    if (m < 2) return 'just now';
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
        <style>{STYLES}</style>
        <article className="card-hero" style={{ '--c': color } as React.CSSProperties}>
          <div className="hero-glow" />
          <div className="hero-bar" style={{ background: color }} />
          <div className="hero-body">
            <div className="meta-row">
              <button className="badge" onClick={() => onTagClick(story.tag)}>
                <span className="badge-dot" style={{ background: color }} />
                {(story as any).emoji || ''} {label}
              </button>
              <span className="source-label">{story.source}</span>
              <span className="time-label">{ago}</span>
            </div>
            <h1 className="hero-title">
              <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
            </h1>
            {body && (
              <p className="hero-body-text">
                {body.slice(0, 300)}{body.length > 300 ? '…' : ''}
              </p>
            )}
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
        <style>{STYLES}</style>
        <article className="card-sec" style={{ '--c': color } as React.CSSProperties}>
          <div className="sec-bar" style={{ background: color }} />
          <div className="sec-body">
            <div className="meta-row">
              <button className="badge sm" onClick={() => onTagClick(story.tag)}>
                {label}
              </button>
              <span className="time-label">{ago}</span>
            </div>
            <h2 className="sec-title">
              <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
            </h2>
            {body && (
              <p className="sec-body-text">
                {body.slice(0, 160)}{body.length > 160 ? '…' : ''}
              </p>
            )}
            <span className="source-label sm">{story.source}</span>
          </div>
        </article>
      </>
    );
  }

  // Standard grid card
  return (
    <>
      <style>{STYLES}</style>
      <article className="card" style={{ '--c': color } as React.CSSProperties}>
        <div className="card-bar" style={{ background: color }} />
        <div className="card-body">
          <div className="meta-row tight">
            <button className="badge sm" onClick={() => onTagClick(story.tag)}>
              {label}
            </button>
            <span className="time-label">{ago}</span>
          </div>
          <h3 className="card-title">
            <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
          </h3>
          {body && (
            <p className="card-body-text">
              {body.slice(0, 180)}{body.length > 180 ? '…' : ''}
            </p>
          )}
          <div className="card-foot">
            <span className="source-label sm">{story.source}</span>
            <a className="arrow-link" href={story.url} target="_blank" rel="noopener noreferrer">→</a>
          </div>
        </div>
      </article>
    </>
  );
}

const STYLES = `
/* ── Hero ──────────────────────────────────────────── */
.card-hero {
  position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 3px;
  background: #0d0f15;
  transition: border-color 0.2s;
}
.card-hero:hover { border-color: rgba(255,255,255,0.18); }

.hero-glow {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 70% 50% at 0% 0%, color-mix(in srgb, var(--c) 8%, transparent), transparent 70%);
}
.hero-bar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
}
.hero-body { padding: 28px 32px 28px 36px; position: relative; }

.hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(26px, 3.2vw, 42px);
  font-weight: 900; line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 12px 0 16px;
}
.hero-title a { color: #edf0f8; text-decoration: none; transition: color 0.15s; }
.hero-title a:hover { color: #fff; }

.hero-body-text {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px; line-height: 1.68;
  color: #828a9e; max-width: 68ch;
  margin-bottom: 22px;
}
.read-link {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px; letter-spacing: 0.04em;
  color: #4f8ef7; text-decoration: none; font-weight: 500;
  transition: opacity 0.15s;
}
.read-link:hover { opacity: 0.7; }

/* ── Secondary ─────────────────────────────────────── */
.card-sec {
  position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 3px; background: #0d0f15;
  display: flex; flex-direction: column;
  transition: border-color 0.2s, background 0.2s;
}
.card-sec:hover { border-color: rgba(255,255,255,0.15); background: #10121a; }

.sec-bar { height: 2px; width: 100%; flex-shrink: 0; }
.sec-body {
  padding: 18px 20px 20px; flex: 1;
  display: flex; flex-direction: column; gap: 9px;
}
.sec-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px; font-weight: 700;
  line-height: 1.28; letter-spacing: -0.01em;
}
.sec-title a { color: #dde1ec; text-decoration: none; transition: color 0.15s; }
.sec-title a:hover { color: #fff; }
.sec-body-text {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px; line-height: 1.62; color: #6a7080; flex: 1;
}

/* ── Grid card ─────────────────────────────────────── */
.card {
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 3px; background: #0d0f15;
  display: flex; flex-direction: column; overflow: hidden;
  transition: border-color 0.18s, background 0.18s, transform 0.15s;
}
.card:hover {
  border-color: rgba(255,255,255,0.14);
  background: #10121a;
  transform: translateY(-2px);
}
.card-bar { height: 2px; width: 100%; flex-shrink: 0; }
.card-body {
  padding: 16px 18px 15px; flex: 1;
  display: flex; flex-direction: column; gap: 9px;
}
.card-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px; font-weight: 600;
  line-height: 1.38; letter-spacing: -0.01em;
}
.card-title a { color: #ced3e3; text-decoration: none; transition: color 0.15s; }
.card-title a:hover { color: #fff; }
.card-body-text {
  font-size: 13.5px; line-height: 1.62; color: #5d6375; flex: 1;
}
.card-foot {
  display: flex; align-items: center;
  justify-content: space-between;
  padding-top: 11px;
  border-top: 1px solid rgba(255,255,255,0.05);
  margin-top: 4px;
}
.arrow-link {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px; color: #3d4357;
  text-decoration: none; transition: color 0.15s;
}
.arrow-link:hover { color: #4f8ef7; }

/* ── Shared ─────────────────────────────────────────── */
.meta-row {
  display: flex; align-items: center; gap: 9px; flex-wrap: wrap;
}
.meta-row.tight { gap: 7px; }

.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 2px;
  border: 1px solid color-mix(in srgb, var(--c) 38%, transparent);
  background: color-mix(in srgb, var(--c) 13%, transparent);
  color: var(--c);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; font-weight: 500;
  letter-spacing: 0.07em; text-transform: uppercase;
  cursor: pointer; transition: opacity 0.15s;
}
.badge:hover { opacity: 0.78; }
.badge.sm { font-size: 10.5px; padding: 2px 8px; }
.badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

.source-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px; color: #434858;
}
.source-label.sm { font-size: 11px; }
.time-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; color: #333845;
  margin-left: auto;
}
`;
