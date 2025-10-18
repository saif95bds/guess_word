import { useEffect, useState } from 'react';
import type { AppConfig } from '../types/config';

interface EffectsLayerProps {
  config: AppConfig;
  trigger: 'correct' | 'incorrect' | 'roundComplete' | null;
  onComplete?: () => void;
}

export default function EffectsLayer({ config, trigger, onComplete }: EffectsLayerProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSadFace, setShowSadFace] = useState(false);
  const [shakeImages, setShakeImages] = useState(false);
  const [collideImages, setCollideImages] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!trigger) return;

    const effectDuration = config.effects.durationMs || 700;

    switch (trigger) {
      case 'correct':
        handleCorrectEffect(effectDuration);
        break;
      case 'incorrect':
        handleIncorrectEffect(effectDuration);
        break;
      case 'roundComplete':
        handleRoundCompleteEffect(effectDuration);
        break;
    }
  }, [trigger, config.effects]);

  const handleCorrectEffect = (duration: number) => {
    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }

    const motion = config.effects.correct?.motion || 'none';

    switch (motion) {
      case 'collide':
        setCollideImages(true);
        setTimeout(() => {
          setCollideImages(false);
          onComplete?.();
        }, duration);
        break;
      case 'bounce':
        // Future implementation
        onComplete?.();
        break;
      case 'flash':
        // Future implementation
        onComplete?.();
        break;
      default:
        onComplete?.();
    }
  };

  const handleIncorrectEffect = (duration: number) => {
    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }

    const incorrect = config.effects.incorrect;
    const effectType = typeof incorrect === 'string' ? incorrect : incorrect?.type || 'none';

    switch (effectType) {
      case 'shake':
        setShakeImages(true);
        setShowSadFace(true);
        setTimeout(() => {
          setShakeImages(false);
          setTimeout(() => {
            setShowSadFace(false);
            onComplete?.();
          }, duration);
        }, duration);
        break;
      case 'border':
        // Future implementation
        onComplete?.();
        break;
      default:
        onComplete?.();
    }
  };

  const handleRoundCompleteEffect = (duration: number) => {
    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }

    const roundEffect = config.effects.roundComplete || 'none';

    if (roundEffect === 'confetti') {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, duration * 2); // Confetti lasts longer
    } else {
      onComplete?.();
    }
  };

  // Calculate sad face size from config
  const getSadFaceSize = () => {
    const incorrect = config.effects.incorrect;
    if (typeof incorrect === 'object' && incorrect?.overlaySizePct) {
      return incorrect.overlaySizePct;
    }
    return 22; // Default 22%
  };

  return (
    <>
      {/* Collide Effect - applied via CSS class to images */}
      {collideImages && <div className="effect-collide-active" data-effect="collide" />}
      
      {/* Shake Effect - applied via CSS class to images */}
      {shakeImages && <div className="effect-shake-active" data-effect="shake" />}
      
      {/* Sad Face Overlay */}
      {showSadFace && (
        <div className="sad-face-overlay" aria-hidden="true">
          <svg
            width={`${getSadFaceSize()}%`}
            height={`${getSadFaceSize()}%`}
            viewBox="0 0 100 100"
            className="sad-face-svg"
          >
            {/* Face circle */}
            <circle cx="50" cy="50" r="45" fill="#FFC107" stroke="#FF9800" strokeWidth="2" />
            
            {/* Left eye */}
            <circle cx="35" cy="40" r="5" fill="#333" />
            
            {/* Right eye */}
            <circle cx="65" cy="40" r="5" fill="#333" />
            
            {/* Sad mouth (arc) */}
            <path
              d="M 30 70 Q 50 55 70 70"
              stroke="#333"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Tear drop (left) */}
            <ellipse cx="35" cy="50" rx="3" ry="6" fill="#4FC3F7" opacity="0.8" />
          </svg>
        </div>
      )}
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="confetti-container" aria-hidden="true">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: getRandomColor(),
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

// Helper function for confetti colors
function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
