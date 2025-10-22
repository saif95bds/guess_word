import { useState, useEffect } from 'react';
import { buildSrcset, getDefaultSrc, getSizesAttribute } from '../core/images';
import type { AppConfig } from '../types/config';

interface ImageCardProps {
  srcBase?: string;
  alt: string;
  wordPart: string;
  onTap: () => void;
  config?: AppConfig;
}

export default function ImageCard({ srcBase, alt, wordPart, onTap, config }: ImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showWordPart, setShowWordPart] = useState(false);

  // Reset state when srcBase changes (new puzzle)
  useEffect(() => {
    console.log('ImageCard: srcBase changed to:', srcBase);
    setImageError(false);
    setShowWordPart(false);
  }, [srcBase]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    // Toggle between showing image and showing wordPart
    setShowWordPart(!showWordPart);
    // Call parent's onTap handler (e.g., to focus input)
    onTap();
  };

  const renderContent = () => {
    // If user clicked to reveal wordPart, show it
    if (showWordPart) {
      return (
        <div className="image-placeholder">
          <span className="placeholder-text wordpart-reveal">{wordPart}</span>
        </div>
      );
    }

    // If no image source or config, show placeholder
    if (!srcBase || !config) {
      return (
        <div className="image-placeholder">
          <span className="placeholder-text">Image</span>
        </div>
      );
    }

    // If image failed to load, show wordPart
    if (imageError) {
      return (
        <div className="image-placeholder">
          <span className="placeholder-text">{wordPart}</span>
        </div>
      );
    }

    // Show the actual image
    const srcset = buildSrcset(srcBase, config);
    const defaultSrc = getDefaultSrc(srcBase, config);
    const sizes = getSizesAttribute();

    return (
      <img 
        src={defaultSrc}
        srcSet={srcset}
        sizes={sizes}
        alt={alt}
        className="card-image"
        onError={handleImageError}
        loading="lazy"
      />
    );
  };

  return (
    <div className="image-card" onClick={handleClick}>
      <div className="image-container">
        {renderContent()}
      </div>
    </div>
  );
}