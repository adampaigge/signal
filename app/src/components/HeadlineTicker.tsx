import { useState, useEffect, useRef } from 'react';
import type { Story } from '../types/story';
import { TAG_COLORS, TAG_LABELS } from '../pages/Home';

interface Props { stories: Story[]; }

const INTERVAL = 6000;

export default function HeadlineTicker({ stories }: Props) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const advance = (next: number) => {
    setFading(true);
    setTimeout(() => { setIdx(next); setFading(false); }, 300);
  };

  useEffect(() => {
    if (stories.length < 2) return;
    timer.current = setTimeout(() => advance((idx + 1) % stories.length), INTERVAL);
    return () => clearTimeout(timer.current);
  }, [idx, stories.length]);

  if (!stories.length) return null;
  const story = stories[idx];
  const color = (story as any).color || TAG_COLORS[story.tag] || '#e8611a';

  return (
    <>
      <style>{`
        .ticker {
          position: relative; z-index: 40;
          background: rgba(7,8,12,0.97);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ticker-inner {
          max-width: 1480px; margin: 0 auto; padding: 0 28px;
          height: 34px; display: flex; align-items: center; gap: 14px; overflow: hidden;
        }
        .ticker-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 9px; font-weight: 500; letter-spacing: 0.2em;
          color: #e8611a; text-transform: uppercase; flex-shrink: 0;
        }
        .ticker-rule { width: 1px; height: 12px; background: rgba(255,255,255,0.1); flex-shrink: 0; }
        .ticker-content {
          display: flex; align-items: center; gap: 10px;
          flex: 1; min-width: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .ticker-content.out { opacity: 0; transform: translateY(5px); }
        .ticker-tag {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; flex-shrink: 0;
        }
        .ticker-hed {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px; font-weight: 400;
          color: #b0b6c8; text-decoration: none;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color 0.15s;
        }
        .ticker-hed:hover { color: #fff; }
        .ticker-dots {
          display: flex; align-items: center; gap: 5px; flex-shrink: 0; margin-left: auto;
        }
        .ticker-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,0.12); border: none; cursor: pointer; padding: 0;
          transition: background 0.2s, transform 0.2s;
        }
        .ticker-dot.on { transform: scale(1.4); }
        .ticker-dot:hover { background: rgba(255,255,255,0.3); }
      `}</style>
      <div className="ticker">
        <div className="ticker-inner">
          <span className="ticker-eyebrow">Signal</span>
          <div className="ticker-rule" />
          <div className={`ticker-content${fading ? ' out' : ''}`}>
            <span className="ticker-tag" style={{ color }}>{TAG_LABELS[story.tag] || story.tag}</span>
            <a className="ticker-hed" href={story.url} target="_blank" rel="noopener noreferrer">
              {story.title}
            </a>
          </div>
          {stories.length > 1 && (
            <div className="ticker-dots">
              {stories.map((_, i) => (
                <button
                  key={i}
                  className={`ticker-dot${i === idx ? ' on' : ''}`}
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
