import { useState, useEffect, useRef } from 'react';
import type { Story } from '../types/story';
import { TAG_COLORS, TAG_LABELS } from '../pages/Home';

interface Props { stories: Story[]; }

const INTERVAL = 5000;

export default function HeadlineTicker({ stories }: Props) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const advance = (next: number) => {
    setFading(true);
    setTimeout(() => {
      setIdx(next);
      setFading(false);
    }, 280);
  };

  useEffect(() => {
    if (stories.length < 2) return;
    timer.current = setTimeout(() => {
      advance((idx + 1) % stories.length);
    }, INTERVAL);
    return () => clearTimeout(timer.current);
  }, [idx, stories.length]);

  if (!stories.length) return null;

  const story = stories[idx];
  const color = (story as any).color || TAG_COLORS[story.tag] || '#4f8ef7';
  const label = TAG_LABELS[story.tag] || story.tag;

  return (
    <>
      <style>{TICKER_STYLES}</style>
      <div className="ticker-bar">
        <div className="ticker-inner">
          <span className="ticker-label">SIGNAL</span>
          <div className="ticker-divider" />
          <div className={`ticker-content ${fading ? 'fading' : ''}`}>
            <span className="ticker-tag" style={{ color }}>
              {label}
            </span>
            <a
              className="ticker-headline"
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {story.title}
            </a>
          </div>
          {stories.length > 1 && (
            <div className="ticker-dots">
              {stories.map((_, i) => (
                <button
                  key={i}
                  className={`ticker-dot ${i === idx ? 'active' : ''}`}
                  style={i === idx ? { background: color } : {}}
                  onClick={() => { clearTimeout(timer.current); advance(i); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const TICKER_STYLES = `
.ticker-bar {
  position: relative; z-index: 40;
  background: #0a0c12;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.ticker-inner {
  max-width: 1440px; margin: 0 auto;
  padding: 0 24px;
  height: 36px;
  display: flex; align-items: center; gap: 12px;
  overflow: hidden;
}
.ticker-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px; font-weight: 500;
  letter-spacing: 0.16em; color: #4f8ef7;
  text-transform: uppercase; flex-shrink: 0;
}
.ticker-divider {
  width: 1px; height: 14px;
  background: rgba(255,255,255,0.1);
  flex-shrink: 0;
}
.ticker-content {
  display: flex; align-items: center; gap: 10px;
  flex: 1; min-width: 0;
  transition: opacity 0.28s ease, transform 0.28s ease;
}
.ticker-content.fading {
  opacity: 0; transform: translateY(4px);
}
.ticker-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase;
  flex-shrink: 0;
}
.ticker-headline {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #c8ccda; text-decoration: none;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.15s;
}
.ticker-headline:hover { color: #fff; }
.ticker-dots {
  display: flex; align-items: center; gap: 5px;
  flex-shrink: 0; margin-left: auto;
}
.ticker-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: none; cursor: pointer; padding: 0;
  transition: background 0.2s, transform 0.2s;
}
.ticker-dot.active { transform: scale(1.3); }
.ticker-dot:hover { background: rgba(255,255,255,0.35); }
`;
