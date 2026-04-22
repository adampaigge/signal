import { TrendingUp, ArrowRight } from 'lucide-react';

interface Trend {
  id: string;
  text: string;
  posted_at: string;
  related_tags: string[];
}

interface TrendSectionProps {
  trends: Trend[];
}

const TAG_COLORS: Record<string, string> = {
  space: '#3b82f6',
  lunar: '#8b5cf6',
  ai: '#10b981',
  robotics: '#f59e0b',
  drones: '#06b6d4',
  '3dprint': '#ec4899',
  futurology: '#f97316',
  tech: '#64748b',
  youtube: '#ef4444',
  tiktok: '#a855f7',
};

export default function TrendSection({ trends }: TrendSectionProps) {
  if (trends.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
          Trend Analysis
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trends.map((trend) => (
          <div
            key={trend.id}
            className="group relative rounded-xl border border-amber-500/10 bg-amber-500/5 backdrop-blur-sm p-5 hover:border-amber-500/20 transition-all"
          >
            <div className="flex items-start gap-3">
              <ArrowRight className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              <div>
                <p className="text-sm leading-relaxed text-foreground/90 mb-3">
                  {trend.text}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {trend.related_tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                      style={{
                        backgroundColor: `${TAG_COLORS[tag] || '#64748b'}15`,
                        color: TAG_COLORS[tag] || '#64748b',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
