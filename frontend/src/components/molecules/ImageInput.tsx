import React, { useState } from 'react';
import styles from './ImageInput.module.css';

interface ImageInputProps {
  images: string[];
  onAddImage: (url: string) => void;
  onRemoveImage: (index: number) => void;
  error?: string;
}

const ImageInput: React.FC<ImageInputProps> = ({
  images,
  onAddImage,
  onRemoveImage,
  error,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');

  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      setImageError('Image URL cannot be empty');
      return;
    }

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      setImageError('Image URL must start with http:// or https://');
      return;
    }

    onAddImage(imageUrl);
    setImageUrl('');
    setImageError('');
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        Images <span className={styles.required}>*</span>
      </label>
      <p className={styles.helperText}>
        Add vehicle images by providing image URLs (must start with http:// or https://)
      </p>

      <div className={styles.imageInputGroup}>
        <input
          type="url"
          value={imageUrl}
          onChange={e => {
            setImageUrl(e.target.value);
            if (imageError) setImageError('');
          }}
          placeholder="https://example.com/image.jpg"
          className={`${styles.input} ${imageError ? styles.inputError : ''}`}
        />
        <button
          type="button"
          onClick={handleAddImage}
          className={styles.addImageBtn}
        >
          + Add Image
        </button>
      </div>
      {imageError && <span className={styles.errorMessage}>{imageError}</span>}
      {error && <span className={styles.errorMessage}>{error}</span>}

      {images.length > 0 && (
        <div className={styles.imagePreviewContainer}>
          <h3 className={styles.previewTitle}>Added Images ({images.length})</h3>
          <div className={styles.imageGrid}>
            {images.map((img, index) => (
              <div key={index} className={styles.imageCard}>
                <img
                  src={img}
                  alt={`Preview ${index + 1}`}
                  className={styles.previewImage}
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"%3E%3Crect fill="%23f0f0f0" width="200" height="150"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="14"%3EImage failed%3C/text%3E%3C/svg%3E';
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className={styles.removeImageBtn}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageInput;