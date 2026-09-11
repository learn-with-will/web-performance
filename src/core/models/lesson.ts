export type LessonLevel = 'beginner' | 'intermediate' | 'advanced';

/** A single entry in course-manifest.json. */
export interface LessonMeta {
  id: string;
  slug: string;
  title: string;
  level: LessonLevel;
  order: number;
  /** Estimated reading time in minutes. */
  duration: number;
  /** Path to the markdown file, relative to /content. */
  file: string;
  /** Optional short description shown on cards. */
  summary?: string;
  tags?: string[];
}

/** A heading extracted from lesson markdown, used to build the table of contents. */
export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/** A fully loaded lesson: metadata plus rendered-ready markdown body. */
export interface Lesson {
  meta: LessonMeta;
  /** Raw markdown with front-matter stripped. */
  content: string;
  toc: TocEntry[];
}

export const LEVELS: LessonLevel[] = ['beginner', 'intermediate', 'advanced'];

export const LEVEL_LABELS: Record<LessonLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const LEVEL_BLURBS: Record<LessonLevel, string> = {
  beginner:
    'How the web loads and how to measure it — why speed matters, how the browser turns HTML, CSS, and JavaScript into pixels along the critical rendering path, the Core Web Vitals and their thresholds, and reading Lighthouse, field data, and the network waterfall before you change a thing.',
  intermediate:
    'Hands-on optimization — improving LCP, CLS, and INP directly, then the asset-level wins: modern image formats and responsive images, font-loading strategy, HTTP caching, text compression, and clearing render-blocking CSS and JavaScript from the critical path.',
  advanced:
    'Production performance — the real cost of JavaScript and taming main-thread work, resource hints and priorities, HTTP/2, HTTP/3 and CDNs, rendering strategies (CSR, SSR, SSG, streaming), service-worker caching, monitoring with real-user field data, and an end-to-end audit capstone.',
};

/** Badge utility class per level; defined in index.css. */
export const LEVEL_BADGES: Record<LessonLevel, string> = {
  beginner: 'badge-beginner',
  intermediate: 'badge-intermediate',
  advanced: 'badge-advanced',
};

/** Gradient stops for each level's accent bar — a distinct hue per difficulty. */
export const LEVEL_ACCENTS: Record<LessonLevel, string> = {
  beginner: 'from-emerald-400 to-teal-500',
  intermediate: 'from-amber-400 to-orange-500',
  advanced: 'from-violet-400 to-purple-600',
};
