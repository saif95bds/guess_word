import { useEffect, useRef } from 'react';

interface SummaryModalProps {
  isVisible: boolean;
  score: { correct: number; total: number; reason?: 'timeup' | 'completed' | 'exit' };
  onReplay: () => void;
  onChangeMode: () => void;
  onClose: () => void;
  title?: string;
  scoreText?: string;
  replayText?: string;
  changeModeText?: string;
  perfectScoreText?: string;
  noAttemptsText?: string;
}

export default function SummaryModal({ 
  isVisible, 
  score, 
  onReplay, 
  onChangeMode, 
  onClose,
  title = "Round Complete!",
  scoreText,
  replayText = "Replay",
  changeModeText = "Change Mode",
  perfectScoreText = "Perfect! All correct!",
  noAttemptsText = "No puzzles attempted this round"
}: SummaryModalProps) {
  const replayButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard events
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close modal on Escape key
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Handle Enter on Replay button (default action)
      if (e.key === 'Enter' && document.activeElement === replayButtonRef.current) {
        onReplay();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the replay button when modal opens
    if (replayButtonRef.current) {
      replayButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose, onReplay]);

  if (!isVisible) return null;

  const defaultScoreText = `You got ${score.correct} out of ${score.total} correct!`;
  let displayScoreText = scoreText || defaultScoreText;
  
  // Special messages for perfect score or no attempts
  if (score.total > 0 && score.correct === score.total) {
    displayScoreText = perfectScoreText;
  } else if (score.total === 0) {
    displayScoreText = noAttemptsText;
  }

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="summary-title">{title}</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close summary"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="score-summary">
            <p className="final-score" role="status" aria-live="polite">
              {displayScoreText}
            </p>
            
            {score.total > 0 && (
              <div className="score-percentage" aria-label={`Score percentage: ${Math.round((score.correct / score.total) * 100)} percent`}>
                {Math.round((score.correct / score.total) * 100)}%
              </div>
            )}
          </div>
          
          <div className="modal-actions">
            <button 
              ref={replayButtonRef}
              className="replay-btn" 
              onClick={onReplay}
              aria-label="Replay the game with the same settings"
            >
              {replayText}
            </button>
            
            <button 
              className="change-mode-btn" 
              onClick={onChangeMode}
              aria-label="Change game mode and start a new game"
            >
              {changeModeText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}