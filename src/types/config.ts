// TypeScript interfaces for Guess Word game configuration

export interface AnswerImage {
  srcBase: string;
  alt: string;
  word: string;
}

export interface AppConfig {
  version?: number;
  defaultLocale: string;
  enabledModes: string[];
  defaultMode: string;
  timer: {
    enabled: boolean;
    durations: number[];
    default: number;
  };
  selection: {
    strategy: 'random' | 'sequential' | 'shuffled';
    seed?: number | null;
  };
  input: {
    normalizeCase: boolean;
    normalizeDiacritics?: boolean;
    autosubmitOnEnter: boolean;
    focusOnImageTap: boolean;
  };
  effects: {
    correct?: {
      motion?: 'collide' | 'bounce' | 'flash' | 'none';
    };
    incorrect?: 'shake' | 'border' | 'none' | {
      type: 'shake' | 'border' | 'none';
      overlaySizePct?: number;
    };
    roundComplete?: 'confetti' | 'none';
    durationMs?: number;
  };
  answerCard: {
    showImage: boolean;
    transition: 'fade' | 'slide' | 'none';
    durationMs: number;
    dismissOnClick: boolean;
  };
  images: {
    preferFormats?: string[];
    tiers: number[];
    budgetKB: number;
  };
}

export interface Strings {
  [key: string]: any;
}

export interface Puzzle {
  id: string;
  image1: {
    srcBase: string;
    alt: string;
    wordPart: string;
  };
  image2: {
    srcBase: string;
    alt: string;
    wordPart: string;
  };
  answerImage: AnswerImage;
  answer: string;
  tags?: string[];
  childrenSafe?: boolean;
}

export interface GameState {
  mode: string;
  index: number;
  correct: number;
  total: number;
  timeLeft?: number;
  current: Puzzle;
}

export interface Summary {
  correct: number;
  total: number;
  reason: 'timeup' | 'completed' | 'exit';
}