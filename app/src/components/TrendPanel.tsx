import { useState, useEffect, useMemo } from 'react';
import type { Story } from '../types/story';
import { TAG_LABELS, TAG_COLORS } from '../pages/Home';

interface Props {
  stories: Story[];
}

interface TrendInsight {
  id: string;
  type: 'surge' | 'crossover' | 'velocity' | 'cluster';
  headline: string;
  detail: string;
  tags: string[];
  score: number;
  expiresAt: number; // timestamp
}

// ── Compute real insights from story data ─────────────────────
function computeInsights(stories: Story[]): TrendInsight[] {
  if (stories.length < 4) return [];

  const now = Date.now();
  const insights: TrendInsight[] = [];

  // 1. Tag velocity: which tags have the most stories in the last 12h vs 12-48h?
  const recent12h = stories.filter(s => now - new Date(s.fetched_at).getTime() < 12 * 3600 * 1000);
  const prev12_48h = stories.filter(s => {
    const age = now - new Date(s.fetched_at).getTime();
    return age >= 12 * 3600 * 1000 && age < 48 * 3600 * 1000;
  });

  const recentCounts: Record<string, number> = {};
  const prevCounts: Record<string, number> = {};
  recent12h.forEach(s => { recentCounts[s.tag] = (recentCounts[s.tag] || 0) + 1; });
  prev12_48h.forEach(s => { prevCounts[s.tag] = (prevCounts[s.tag] || 0) + 1; });

  const velocities: Array<{ tag: string; ratio: number; count: number }> = [];
  for (const [tag, count] of Object.entries(recentCounts)) {
    const prev = prevCounts[tag] || 0.5;
    const ratio = count / prev;
    if (ratio >= 1.5 && count >= 2) {
      velocities.push({ tag, ratio, count });
    }
  }
  velocities.sort((a, b) => b.ratio - a.ratio);
  if (velocities[0]) {
    const { tag, ratio, count } = velocities[0];
    insights.push({
      id: `vel-${tag}`,
      type: 'velocity',
      headline: `${TAG_LABELS[tag] || tag} signal rising`,
      detail: `${count} stories in the last 12h — ${ratio.toFixed(1)}× the prior period. Something is moving.`,
      tags: [tag],
      score: ratio * count,
      expiresAt: now + 3 * 3600 * 1000,
    });
  }

  // 2. Cross-tag co-occurrence: which tags appear together in story clusters?
  // Simple proxy: find stories whose titles share significant words across tags
  const tagWords: Record<string, Set<string>> = {};
  stories.slice(0, 80).forEach(s => {
    if (!tagWords[s.tag]) tagWords[s.tag] = new Set();
    s.title.toLowerCase().split(/\s+/).filter(w => w.length > 5).forEach(w => {
      tagWords[s.tag].add(w);
    });
  });

  const tagList = Object.keys(tagWords);
  for (let i = 0; i < tagList.length; i++) {
    for (let j = i + 1; j < tagList.length; j++) {
      const a = tagList[i], b = tagList[j];
      if (a === b) continue;
      const overlap = [...tagWords[a]].filter(w => tagWords[b].has(w));
      if (overlap.length >= 2) {
        const shared = overlap.slice(0, 3).join(', ');
        insights.push({
          id: `cross-${a}-${b}`,
          type: 'crossover',
          headline: `${TAG_LABELS[a] || a} × ${TAG_LABELS[b] || b} overlap`,
          detail: `Shared themes: "${shared}". Cross-domain convergence often signals a capability shift.`,
          tags: [a, b],
          score: overlap.length * 1.5,
          expiresAt: now + 6 * 3600 * 1000,
        });
      }
    }
  }

  // 3. Dominant source surge: any single source producing disproportionate volume?
  const sourceCounts: Record<string, { count: number; tag: string }> = {};
  recent12h.forEach(s => {
    if (!sourceCounts[s.source]) sourceCounts[s.source] = { count: 0, tag: s.tag };
    sourceCounts[s.source].count++;
  });
  const topSource = Object.entries(sourceCounts)
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)[0];

  if (topSource) {
    const [src, { count, tag }] = topSource;
    insights.push({
      id: `src-${src}`,
      type: 'surge',
      headline: `${src} surging`,
      detail: `${count} stories indexed in the last 12h from this source — notably above baseline.`,
      tags: [tag],
      score: count,
      expiresAt: now + 4 * 3600 * 1000,
    });
  }

  // 4. Story cluster by keyword proximity
  const keywordMap: Record<string, Story[]> = {};
  stories.slice(0, 100).forEach(s => {
    const words = s.title.toLowerCase().match(/\b[a-z]{6,}\b/g) || [];
    words.forEach(w => {
      if (!keywordMap[w]) keywordMap[w] = [];
      keywordMap[w].push(s);
    });
  });

  const hotWords = Object.entries(keywordMap)
    .filter(([, ss]) => ss.length >= 3 && new Set(ss.map(s => s.tag)).size >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  hotWords.forEach(([word, ss]) => {
    const tags = [...new Set(ss.map(s => s.tag))].slice(0, 3);
    insights.push({
      id: `cluster-${word}`,
      type: 'cluster',
      headline: `"${word}" clustering across ${tags.length} categories`,
      detail: `${ss.length} stories referencing this across ${tags.map(t => TAG_LABELS[t] || t).join(', ')}. Pattern suggests emerging narrative.`,
      tags,
      score: ss.length * tags.length,
      expiresAt: now + 8 * 3600 * 1000,
    });
  });

  return insights
    .filter(i => i.expiresAt > now)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

const TYPE_LABELS: Record<string, string> = {
  surge: 'SURGE', crossover: 'CROSSOVER', velocity: 'VELOCITY', cluster: 'CLUSTER',
};
const TYPE_COLORS: Record<string, string> = {
  surge: '#f87171', crossover: '#a78bfa', velocity: '#34d399', cluster: '#fbbf24',
};

// Countdown to insight expiry
function useCountdown(expiresAt: number) {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiresAt - Date.now()));
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(0, expiresAt - Date.now()));
    }, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function InsightItem({ insight }: { insight: TrendInsight }) {
  const countdown = useCountdown(insight.expiresAt);
  const typeColor = TYPE_COLORS[insight.type] || '#4f8ef7';

  return (
    <div className="insight">
      <div className="insight-header">
        <span className="insight-type" style={{ color: typeColor }}>
          {TYPE_LABELS[insight.type]}
        </span>
        <span className="insight-timer" title="Insight expires in">{countdown}</span>
      </div>
      <p className="insight-headline">{insight.headline}</p>
      <p className="insight-detail">{insight.detail}</p>
      <div className="insight-tags">
        {insight.tags.map(t => (
          <span key={t} className="insight-tag" style={{ '--tc': TAG_COLORS[t] || '#4f8ef7' } as React.CSSProperties}>
            {TAG_LABELS[t] || t}
          </span>
        ))}
      </div>
      <div className="insight-decay">
        <div
          className="insight-decay-bar"
          style={{
            width: `${Math.max(2, ((insight.expiresAt - Date.now()) / (8 * 3600 * 1000)) * 100)}%`,
            background: typeColor,
          }}
        />
      </div>
    </div>
  );
}

export default function TrendPanel({ stories }: Props) {
  const insights = useMemo(() => computeInsights(stories), [stories]);

  if (insights.length === 0) {
    return (
      <>
        <style>{PANEL_STYLES}</style>
        <div className="trend-panel">
          <div className="panel-head">
            <span className="panel-label">SIGNAL TRENDS</span>
          </div>
          <div className="panel-empty">
            <p>Trend analysis requires more indexed stories. Check back after the next bot cycle.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{PANEL_STYLES}</style>
      <div className="trend-panel">
        <div className="panel-head">
          <span className="panel-label">SIGNAL TRENDS</span>
          <span className="panel-meta">{insights.length} active</span>
        </div>
        <div className="insights-list">
          {insights.map(i => <InsightItem key={i.id} insight={i} />)}
        </div>
        <div className="panel-foot">
          Insights computed from {stories.length} indexed stories · time-limited
        </div>
      </div>
    </>
  );
}

const PANEL_STYLES = `
.trend-panel {
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 3px;
  background: #0c0e14;
  overflow: hidden;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: #0f1117;
}
.panel-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px; font-weight: 500;
  letter-spacing: 0.14em; color: #5e6372;
  text-transform: uppercase;
}
.panel-meta {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; color: #3d4254;
}
.insights-list { display: flex; flex-direction: column; }
.insight {
  padding: 14px 14px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.15s;
}
.insight:last-child { border-bottom: none; }
.insight:hover { background: rgba(255,255,255,0.02); }
.insight-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 5px;
}
.insight-type {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; font-weight: 500;
  letter-spacing: 0.12em; text-transform: uppercase;
}
.insight-timer {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; color: #3d4254;
}
.insight-headline {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 13px; font-weight: 600;
  line-height: 1.3; color: #c8ccda;
  margin-bottom: 5px;
}
.insight-detail {
  font-size: 11.5px; line-height: 1.55; color: #565c6e;
  margin-bottom: 8px;
}
.insight-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; }
.insight-tag {
  padding: 1px 6px;
  border-radius: 2px;
  border: 1px solid color-mix(in srgb, var(--tc) 30%, transparent);
  background: color-mix(in srgb, var(--tc) 10%, transparent);
  color: var(--tc);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.insight-decay {
  height: 2px; background: rgba(255,255,255,0.04);
  border-radius: 1px; overflow: hidden;
}
.insight-decay-bar {
  height: 100%; border-radius: 1px;
  transition: width 60s linear; opacity: 0.7;
}
.panel-empty {
  padding: 20px 14px;
  font-size: 12px; color: #3d4254; line-height: 1.6;
}
.panel-foot {
  padding: 8px 14px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; color: #2d3040;
  border-top: 1px solid rgba(255,255,255,0.04);
  background: #0a0c11;
}
`;
