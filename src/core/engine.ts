// Game Engine for Guess Word
// Manages game state, answer checking, and game flow

import type { AppConfig, Puzzle, GameState, Summary } from '../types/config';

export interface EngineCallbacks {
  onRender: (state: GameState) => void;
  onCorrect?: (state: GameState) => void;
  onIncorrect?: (state: GameState) => void;
  onComplete?: (summary: Summary) => void;
  onTick?: (state: GameState) => void;
}

export class Engine {
  private config: AppConfig;
  private puzzles: Puzzle[];
  private state: GameState | null = null;
  private callbacks: EngineCallbacks;
  private timerInterval: number | null = null;

  constructor(config: AppConfig, puzzles: Puzzle[], callbacks: EngineCallbacks) {
    this.config = config;
    this.puzzles = puzzles;
    this.callbacks = callbacks;
  }

  /**
   * Start a new game session
   */
  start(mode: string): void {
    // Select puzzles based on strategy
    const selectedPuzzles = this.selectPuzzles();
    
    if (selectedPuzzles.length === 0) {
      throw new Error('No puzzles available to start game');
    }

    // Initialize game state
    this.state = {
      mode,
      index: 0,
      correct: 0,
      total: 0,
      current: selectedPuzzles[0],
      timeLeft: mode === 'timed' && this.config.timer.enabled 
        ? this.config.timer.default 
        : undefined
    };

    // Store selected puzzles for this session
    (this.state as any).puzzles = selectedPuzzles;

    // Start timer if in timed mode
    if (mode === 'timed' && this.config.timer.enabled) {
      this.startTimer();
    }

    // Render initial state
    this.callbacks.onRender(this.state);
  }

  /**
   * Submit an answer for evaluation
   */
  submit(answer: string): boolean {
    if (!this.state) {
      throw new Error('Game not started');
    }

    const normalizedAnswer = this.normalizeAnswer(answer);
    const normalizedCorrect = this.normalizeAnswer(this.state.current.answer);
    const isCorrect = normalizedAnswer === normalizedCorrect;

    // Update state
    this.state.total += 1;
    if (isCorrect) {
      this.state.correct += 1;
    }

    // Trigger callbacks
    if (isCorrect && this.callbacks.onCorrect) {
      this.callbacks.onCorrect(this.state);
    } else if (!isCorrect && this.callbacks.onIncorrect) {
      this.callbacks.onIncorrect(this.state);
    }

    // Re-render with updated state
    this.callbacks.onRender(this.state);

    return isCorrect;
  }

  /**
   * Move to the next puzzle
   */
  next(): void {
    if (!this.state) {
      throw new Error('Game not started');
    }

    const puzzles = (this.state as any).puzzles as Puzzle[];
    const nextIndex = this.state.index + 1;

    if (nextIndex >= puzzles.length) {
      // No more puzzles - complete the game
      this.complete('completed');
      return;
    }

    // Move to next puzzle
    this.state.index = nextIndex;
    this.state.current = puzzles[nextIndex];

    // Render updated state
    this.callbacks.onRender(this.state);
  }

  /**
   * Complete the game session
   */
  complete(reason: 'timeup' | 'completed' | 'exit'): void {
    if (!this.state) {
      return;
    }

    // Stop timer
    this.stopTimer();

    // Create summary
    const summary: Summary = {
      correct: this.state.correct,
      total: this.state.total,
      reason
    };

    // Trigger callback
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(summary);
    }

    // Clear state
    this.state = null;
  }

  /**
   * Get current game state
   */
  getState(): GameState | null {
    return this.state;
  }

  /**
   * Normalize answer based on config settings
   */
  private normalizeAnswer(answer: string): string {
    let normalized = answer.trim();

    // Case normalization (if enabled)
    if (this.config.input.normalizeCase) {
      normalized = normalized.toLowerCase();
    }

    // Diacritic normalization (if enabled)
    // Note: For Norwegian, we preserve æ/ø/å by default
    if (this.config.input.normalizeDiacritics) {
      normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    return normalized;
  }

  /**
   * Select puzzles based on strategy from config
   */
  private selectPuzzles(): Puzzle[] {
    const strategy = this.config.selection.strategy;
    const puzzles = [...this.puzzles];

    switch (strategy) {
      case 'sequential':
        return puzzles;
      
      case 'random':
        return this.shufflePuzzles(puzzles);
      
      case 'shuffled':
        return this.shufflePuzzles(puzzles);
      
      default:
        return puzzles;
    }
  }

  /**
   * Shuffle puzzles array (Fisher-Yates algorithm)
   */
  private shufflePuzzles(puzzles: Puzzle[]): Puzzle[] {
    const shuffled = [...puzzles];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  /**
   * Start the countdown timer
   */
  private startTimer(): void {
    if (this.timerInterval !== null) {
      return;
    }

    this.timerInterval = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Stop the countdown timer
   */
  private stopTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Timer tick - decrement time and check for timeout
   */
  private tick(): void {
    if (!this.state || this.state.timeLeft === undefined) {
      return;
    }

    this.state.timeLeft -= 1;

    // Trigger tick callback
    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.state);
    }

    // Check for timeout
    if (this.state.timeLeft <= 0) {
      this.complete('timeup');
      return;
    }

    // Re-render with updated time
    this.callbacks.onRender(this.state);
  }
}
