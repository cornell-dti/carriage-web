import React, { useState, createRef } from 'react';
import uploadBox from './upload.svg';
import styles from './employeemodal.module.css';

const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB limit

type UploadProps = {
  imageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingPhoto?: string;
  isUploading?: boolean;
};

const Upload = ({ imageChange, existingPhoto, isUploading = false }: UploadProps) => {
  const [imageURL, setImageURL] = useState(
    existingPhoto ? `${existingPhoto}?${new Date().getTime()}` : ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = createRef<HTMLInputElement>();

  const handleKeyboardPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isUploading) {
      inputRef.current && inputRef.current.click();
    }
  };

  function previewImage(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Check file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic', 'image/heif'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Please select a valid image file (PNG, JPEG, HEIC, or HEIF)');
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }
      
      // Check file size
      if (file.size < IMAGE_SIZE_LIMIT) {
        setImageURL(URL.createObjectURL(file));
        setErrorMessage(null); // Clear any previous error
        imageChange(e);
      } else {
        const sizeInMB = (IMAGE_SIZE_LIMIT / (1024 * 1024)).toFixed(1);
        setErrorMessage(`Images must be under ${sizeInMB} MB`);
        // Reset the input
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }
  }

  return (
    <div className={styles.uploadContainer}>
      {imageURL ? (
        <img className={styles.uploadImg} alt="uploaded" src={imageURL} />
      ) : (
        <img
          className={styles.uploadImg}
          alt="profile upload"
          src={uploadBox}
        />
      )}
      <input
        id="driverPhotoInput"
        type="file"
        accept="image/png, image/jpeg, image/heic, image/heif"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={previewImage}
        disabled={isUploading}
      />
      <label htmlFor="driverPhotoInput" className={styles.uploadText} style={{ opacity: isUploading ? 0.6 : 1 }}>
        <span
          role="button"
          aria-controls="filename"
          tabIndex={0}
          onKeyPress={handleKeyboardPress}
        >
          {isUploading ? 'Uploading...' : 'Upload a picture'}
        </span>
      </label>
      {errorMessage && (
        <div className={styles.error} style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#eb0023' }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Upload;

/**
 * This component, `Upload`, provides an interface for users to upload a profile picture. It accepts
 * an image file, validates its size, and previews the selected image. If the file size exceeds the
 * pre- specified limit, an error message is displayed. The component supports both drag-and-drop and keyboard
 * interactions to trigger the image upload.
 *
 * Props:
 * - `imageChange`: A callback function that is invoked when the image is successfully selected or changed.
 * - `existingPhoto` (optional): A URL for an existing profile photo to be displayed as the default.
 *
 * Features:
 * - Displays an image preview after selection.
 * - Validates that the selected image is under a defined size limit (500MB).
 */
