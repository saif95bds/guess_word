import { buildSrcset, getDefaultSrc, getSizesAttribute } from '../core/images';
import { getString } from '../core/strings';
import type { AppConfig, AnswerImage } from '../types/config';

interface AnswerCardProps {
  answerImage: AnswerImage;
  config: AppConfig;
  isVisible: boolean;
  isCorrect?: boolean;
  onDismiss?: () => void;
}

export default function AnswerCard({ answerImage, config, isVisible, isCorrect = true, onDismiss }: AnswerCardProps) {
  if (!isVisible) {
    return null;
  }

  const { showImage, transition, durationMs, dismissOnClick } = config.answerCard;

  // Build transition class based on config
  const transitionClass = transition !== 'none' ? `answer-card-${transition}` : '';
  
  // Inline style for transition duration
  const transitionStyle = {
    animationDuration: `${durationMs}ms`,
    transitionDuration: `${durationMs}ms`
  };

  // Get appropriate message based on correctness
  const message = isCorrect 
    ? getString('accessibility.answerCorrect')
    : getString('accessibility.answerIncorrect', { answer: answerImage.word });

  // Handle click - only if dismissOnClick is enabled
  const handleClick = () => {
    if (dismissOnClick && onDismiss) {
      onDismiss();
    }
  };

  return (
    <>
      {/* Backdrop - also clickable if dismissOnClick is enabled */}
      <div 
        className="answer-card-backdrop"
        onClick={dismissOnClick ? handleClick : undefined}
        style={{ cursor: dismissOnClick ? 'pointer' : 'default' }}
      />
      
      {/* Answer Card */}
      <div 
        className={`answer-card ${transitionClass} ${isCorrect ? 'answer-card-correct' : 'answer-card-incorrect'} ${dismissOnClick ? 'answer-card-clickable' : ''}`}
        style={transitionStyle}
        role="status"
        aria-live="polite"
        onClick={handleClick}
      >
        <div className="answer-card-content">
          {showImage && (
            <div className="answer-image-container">
              <img
                src={getDefaultSrc(answerImage.srcBase, config)}
                srcSet={buildSrcset(answerImage.srcBase, config)}
                sizes={getSizesAttribute()}
                alt={answerImage.alt}
                className="answer-image"
                loading="eager"
              />
            </div>
          )}
          
          <div className="answer-word">
            <span className="answer-label">{message}</span>
            <span className="answer-text">{answerImage.word}</span>
          </div>
        </div>
      </div>
    </>
  );
}
