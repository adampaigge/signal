export interface Story {
  story_id: string;
  title: string;
  url: string;
  excerpt: string;
  tag: string;
  source: string;
  source_type: string;
  fetched_at: string;
  summary: string;
  emoji: string;
  color: string;
  hashtags: string;
  related?: RelatedStory[];
}

export interface RelatedStory {
  story_id: string;
  title: string;
  url: string;
  tag: string;
  source: string;
  distance: number;
}

export interface TagMeta {
  emoji: string;
  hashtags: string;
  color: string;
}

export const TAG_COLORS: Record<string, string> = {
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

export const TAG_LABELS: Record<string, string> = {
  space: 'Space',
  lunar: 'Lunar',
  ai: 'AI',
  robotics: 'Robotics',
  drones: 'Drones',
  '3dprint': '3D Print',
  futurology: 'Futures',
  tech: 'Tech',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};
