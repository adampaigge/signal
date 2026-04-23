import { useRef, useEffect } from 'react';
import type { Story } from '../types/story';
import { TAG_LABELS, TAG_COLORS, ACCENT } from '../pages/Home';

interface Props {
  story: Story;
  onTagClick: (tag: string) => void;
  variant?: 'hero' | 'secondary' | 'card';
  index?: number;
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 2) return 'just now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  } catch { return ''; }
}

export default function StoryCard({ story, onTagClick, variant = 'card', index = 0 }: Props) {
  const color = (story as any).color || TAG_COLORS[story.tag] || ACCENT;
  const label = TAG_LABELS[story.tag] || story.tag;
  const ago = timeAgo(story.fetched_at);
  const body = (story.summary?.trim()) ? story.summary : story.excerpt;
  const hasImage = !!(story as any).og_image;
  const ref = useRef<HTMLElement>(null);

  // Staggered entrance animation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    const t = setTimeout(() => {
      el.style.transition = `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.04}s`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 20);
    return () => clearTimeout(t);
  }, [index]);

  const Tag = (
    <button
      className="story-tag"
      style={{ '--c': color } as React.CSSProperties}
      onClick={() => onTagClick(story.tag)}
    >
      <span className="tag-pip" style={{ background: color }} />
      {label}
    </button>
  );

  if (variant === 'hero') {
    return (
      <>
        <style>{CARD_STYLES}</style>
        <article ref={ref as any} className="card-hero">
          {hasImage && (
            <div className="hero-img-wrap">
              <img
                className="hero-img"
                src={(story as any).og_image}
                alt=""
                loading="lazy"
                onError={e => { (e.currentTarget.parentElement!).style.display = 'none'; }}
              />
              <div className="hero-img-fade" />
            </div>
          )}
          <div className="hero-body" style={{ paddingTop: hasImage ? '20px' : '28px' }}>
            <div className="meta-row">
              {Tag}
              <span className="meta-source">{story.source}</span>
              <span className="meta-time">{ago}</span>
            </div>
            <h1 className="hero-hed">
              <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
            </h1>
            {body && (
              <p className="hero-dek">
                {body.slice(0, 320)}{body.length > 320 ? '…' : ''}
              </p>
            )}
            <a className="hero-read" href={story.url} target="_blank" rel="noopener noreferrer">
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
        <article ref={ref as any} className="card-sec">
          {hasImage && (
            <img
              className="sec-img"
              src={(story as any).og_image}
              alt=""
              loading="lazy"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="sec-body">
            <div className="meta-row">
              {Tag}
              <span className="meta-time">{ago}</span>
            </div>
            <h2 className="sec-hed">
              <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
            </h2>
            {body && (
              <p className="sec-dek">{body.slice(0, 160)}{body.length > 160 ? '…' : ''}</p>
            )}
            <span className="meta-source sm">{story.source}</span>
          </div>
        </article>
      </>
    );
  }

  // Standard card
  return (
    <>
      <style>{CARD_STYLES}</style>
      <article ref={ref as any} className="card-std">
        <div className="card-accent" style={{ background: color }} />
        {hasImage && (
          <img
            className="card-img"
            src={(story as any).og_image}
            alt=""
            loading="lazy"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="card-body">
          <div className="meta-row tight">
            {Tag}
            <span className="meta-time">{ago}</span>
          </div>
          <h3 className="card-hed">
            <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
          </h3>
          {body && (
            <p className="card-dek">{body.slice(0, 180)}{body.length > 180 ? '…' : ''}</p>
          )}
          <div className="card-foot">
            <span className="meta-source sm">{story.source}</span>
            <a className="card-arrow" href={story.url} target="_blank" rel="noopener noreferrer">↗</a>
          </div>
        </div>
      </article>
    </>
  );
}

const CARD_STYLES = `
/* ── Hero ─────────────────────────────────────────── */
.card-hero {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 2px;
  background: #0c0e15;
  overflow: hidden;
  transition: border-color 0.25s;
}
.card-hero:hover { border-color: rgba(255,255,255,0.18); }

.hero-img-wrap {
  position: relative; width: 100%; height: 260px; overflow: hidden;
}
.hero-img {
  width: 100%; height: 100%; object-fit: cover;
  filter: brightness(0.65) saturate(0.8);
  transition: filter 0.4s, transform 0.6s cubic-bezier(0.16,1,0.3,1);
}
.card-hero:hover .hero-img {
  filter: brightness(0.78) saturate(0.95);
  transform: scale(1.02);
}
.hero-img-fade {
  position: absolute; bottom: 0; left: 0; right: 0; height: 60%;
  background: linear-gradient(transparent, #0c0e15);
  pointer-events: none;
}

.hero-body { padding: 28px 28px 28px 32px; }
.hero-hed {
  font-family: 'Newsreader', Georgia, serif;
  font-size: clamp(28px, 3.5vw, 46px);
  font-weight: 800;
  line-height: 1.12; letter-spacing: -0.025em;
  margin: 12px 0 16px;
}
.hero-hed a { color: #edf0f8; text-decoration: none; transition: color 0.15s; }
.hero-hed a:hover { color: #fff; }
.hero-dek {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px; line-height: 1.7;
  color: #737a8f; max-width: 66ch; margin-bottom: 24px;
}
.hero-read {
  font-family: 'DM Mono', monospace;
  font-size: 12px; letter-spacing: 0.06em;
  color: #e8611a; text-decoration: none; font-weight: 500;
  border-bottom: 1px solid rgba(232,97,26,0.3);
  padding-bottom: 1px;
  transition: border-color 0.15s, color 0.15s;
}
.hero-read:hover { border-color: #e8611a; }

/* ── Secondary ────────────────────────────────────── */
.card-sec {
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 2px;
  background: #0c0e15;
  overflow: hidden;
  display: flex; flex-direction: column;
  transition: border-color 0.2s, transform 0.2s cubic-bezier(0.16,1,0.3,1);
}
.card-sec:hover {
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-2px);
}
.sec-img {
  width: 100%; height: 150px; object-fit: cover;
  display: block;
  filter: brightness(0.7) saturate(0.8);
  transition: filter 0.3s;
}
.card-sec:hover .sec-img { filter: brightness(0.82) saturate(0.95); }
.sec-body {
  padding: 18px 20px 20px; flex: 1;
  display: flex; flex-direction: column; gap: 9px;
}
.sec-hed {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 20px; font-weight: 700;
  line-height: 1.25; letter-spacing: -0.015em;
}
.sec-hed a { color: #dde1ec; text-decoration: none; transition: color 0.15s; }
.sec-hed a:hover { color: #fff; }
.sec-dek {
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px; line-height: 1.62; color: #606476; flex: 1;
}

/* ── Standard card ────────────────────────────────── */
.card-std {
  position: relative;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 2px;
  background: #0c0e15;
  overflow: hidden;
  display: flex; flex-direction: column;
  min-height: 180px;
  transition: border-color 0.2s, transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s;
}
.card-std:hover {
  border-color: rgba(255,255,255,0.13);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}
.card-accent {
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  opacity: 0.7;
}
.card-img {
  width: 100%; height: 140px; object-fit: cover;
  display: block;
  filter: brightness(0.65) saturate(0.75);
  transition: filter 0.3s;
}
.card-std:hover .card-img { filter: brightness(0.8) saturate(0.9); }
.card-body {
  padding: 15px 17px 14px; flex: 1;
  display: flex; flex-direction: column; gap: 8px;
}
.card-hed {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px; font-weight: 500;
  line-height: 1.4; letter-spacing: -0.01em;
}
.card-hed a { color: #cdd3e4; text-decoration: none; transition: color 0.15s; }
.card-hed a:hover { color: #fff; }
.card-dek {
  font-size: 13px; line-height: 1.6; color: #555b6d;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.card-arrow {
  font-family: 'DM Mono', monospace;
  font-size: 13px; color: #353c50;
  text-decoration: none; transition: color 0.15s;
}
.card-arrow:hover { color: #e8611a; }

/* ── Shared ───────────────────────────────────────── */
.meta-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.meta-row.tight { gap: 7px; }
.story-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 0; border: none; background: transparent;
  color: var(--c);
  font-family: 'DM Mono', monospace;
  font-size: 10px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer; transition: opacity 0.15s;
}
.story-tag:hover { opacity: 0.7; }
.tag-pip {
  width: 5px; height: 5px; border-radius: 50%;
  flex-shrink: 0;
}
.meta-source {
  font-family: 'DM Mono', monospace;
  font-size: 11px; color: #3d4255;
}
.meta-source.sm { font-size: 10.5px; }
.meta-time {
  font-family: 'DM Mono', monospace;
  font-size: 10px; color: #2d3244;
  margin-left: auto;
}
`;
