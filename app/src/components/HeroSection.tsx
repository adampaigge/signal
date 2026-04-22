import { Zap, Radio, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  storyCount: number;
  tagCount: number;
}

export default function HeroSection({ storyCount, tagCount }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
            <Radio className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">
              Live Feed
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            v6 — Ouroboros
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          <span className="text-foreground">Supernova</span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
            Signal
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
          Curated intelligence from the frontier — space, AI, robotics, and the infrastructure
          of tomorrow. Machine-curated, human-judged, openly published.
        </p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>
              <span className="font-mono font-medium text-foreground">{storyCount}</span> stories
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>
              <span className="font-mono font-medium text-foreground">{tagCount}</span> domains
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>
              Updated <span className="font-mono text-foreground">continuously</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
