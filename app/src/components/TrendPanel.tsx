import type { ClusterData } from '../pages/Home';
import { TAG_COLORS, TAG_LABELS } from '../pages/Home';

interface Props { clusters: ClusterData[]; }

function timeAgo(iso: string): string {
  try {
    const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
    if (h < 1) return 'just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return ''; }
}

function ClusterCard({ cluster }: { cluster: ClusterData }) {
  const tags = cluster.dominant_tags.slice(0, 3);

  return (
    <div className="cluster-card">
      <div className="cluster-header">
        <div className="cluster-tags">
          {tags.map(t => (
            <span
              key={t}
              className="cluster-tag"
              style={{ '--tc': TAG_COLORS[t] || '#4f8ef7' } as React.CSSProperties}
            >
              {TAG_LABELS[t] || t}
            </span>
          ))}
        </div>
        <span className="cluster-meta">{timeAgo(cluster.generated_at)}</span>
      </div>

      {/* LLM observation — pre-computed by bot */}
      {cluster.observation && (
        <div className="synthesis-result">
          <p className="synthesis-text">{cluster.observation}</p>
        </div>
      )}

      {/* Source stories */}
      <ul className="cluster-stories">
        {cluster.stories.slice(0, 4).map(s => (
          <li key={s.story_id}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
            </a>
            <span className="story-source">{s.source}</span>
          </li>
        ))}
        {cluster.stories.length > 4 && (
          <li className="cluster-more">+{cluster.stories.length - 4} more signals</li>
        )}
      </ul>
    </div>
  );
}

export default function TrendPanel({ clusters }: Props) {
  if (!clusters || clusters.length === 0) {
    return (
      <>
        <style>{PANEL_STYLES}</style>
        <div className="trend-panel">
          <div className="panel-head">
            <span className="panel-label">SIGNAL CLUSTERS</span>
          </div>
          <div className="panel-empty">
            Vector clustering requires 48h of indexed stories. Check back after the next bot cycle.
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
          <span className="panel-label">SIGNAL CLUSTERS</span>
          <span className="panel-meta">{clusters.length} patterns</span>
        </div>
        <div className="clusters-list">
          {clusters.map(cluster => (
            <ClusterCard key={cluster.cluster_id} cluster={cluster} />
          ))}
        </div>
        <div className="panel-foot">
          Cross-domain patterns · semantic vector analysis · 48h window
        </div>
      </div>
    </>
  );
}

const PANEL_STYLES = `
.trend-panel {
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 3px; background: #0a0c12; overflow: hidden;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 14px 9px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: #0d0f17;
}
.panel-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px; font-weight: 500;
  letter-spacing: 0.14em; color: #4f8ef7; text-transform: uppercase;
}
.panel-meta { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #383d50; }
.panel-empty { padding: 20px 14px; font-size: 12.5px; color: #3d4254; line-height: 1.6; }
.panel-foot {
  padding: 8px 14px;
  font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #272c3a;
  border-top: 1px solid rgba(255,255,255,0.04); background: #09090f;
}

.clusters-list { display: flex; flex-direction: column; }
.cluster-card {
  padding: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  display: flex; flex-direction: column; gap: 10px;
}
.cluster-card:last-child { border-bottom: none; }

.cluster-header { display: flex; align-items: center; justify-content: space-between; }
.cluster-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.cluster-tag {
  padding: 2px 7px; border-radius: 2px;
  border: 1px solid color-mix(in srgb, var(--tc) 30%, transparent);
  background: color-mix(in srgb, var(--tc) 10%, transparent);
  color: var(--tc);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase;
}
.cluster-meta { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #383d50; }

.synthesis-result {
  border-left: 2px solid rgba(79,142,247,0.5);
  padding: 8px 10px;
  background: rgba(79,142,247,0.04);
  border-radius: 0 2px 2px 0;
}
.synthesis-text {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 13px; line-height: 1.58; color: #b0b8cc;
}

.cluster-stories { list-style: none; display: flex; flex-direction: column; gap: 5px; }
.cluster-stories li {
  display: flex; align-items: baseline; gap: 7px; min-width: 0;
}
.cluster-stories li::before {
  content: '–'; color: #2d3244;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; flex-shrink: 0;
}
.cluster-stories a {
  font-size: 12px; color: #717888; text-decoration: none;
  line-height: 1.4; transition: color 0.15s;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cluster-stories a:hover { color: #bcc2d4; }
.story-source {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px; color: #2d3244; flex-shrink: 0; white-space: nowrap;
}
.cluster-more {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; color: #2d3244; padding-left: 16px;
}
`;
