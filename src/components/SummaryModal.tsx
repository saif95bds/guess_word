interface SummaryModalProps {
  isVisible: boolean;
  score: { correct: number; total: number };
  onReplay: () => void;
  onChangeMode: () => void;
  onClose: () => void;
  title?: string;
  scoreText?: string;
  replayText?: string;
  changeModeText?: string;
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
  changeModeText = "Change Mode"
}: SummaryModalProps) {
  if (!isVisible) return null;

  const defaultScoreText = `You got ${score.correct} out of ${score.total} correct!`;
  const displayScoreText = scoreText || defaultScoreText;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="score-summary">
            <p className="final-score">
              {displayScoreText}
            </p>
            
            <div className="score-percentage">
              {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
            </div>
          </div>
          
          <div className="modal-actions">
            <button className="replay-btn" onClick={onReplay}>
              {replayText}
            </button>
            
            <button className="change-mode-btn" onClick={onChangeMode}>
              {changeModeText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}