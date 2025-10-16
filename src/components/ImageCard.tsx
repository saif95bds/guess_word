import { useState } from 'react';
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

  const handleImageError = () => {
    setImageError(true);
  };

  const renderImage = () => {
    if (!srcBase || !config) {
      return (
        <div className="image-placeholder">
          <span className="placeholder-text">Image</span>
        </div>
      );
    }

    if (imageError) {
      return (
        <div className="image-placeholder">
          <span className="placeholder-text">{wordPart}</span>
        </div>
      );
    }

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
    <div className="image-card" onClick={onTap}>
      <div className="image-container">
        {renderImage()}
      </div>
      <div className="word-part">
        <span>{wordPart}</span>
      </div>
    </div>
  );
}