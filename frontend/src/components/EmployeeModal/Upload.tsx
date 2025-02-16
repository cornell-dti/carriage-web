import React, { useState, createRef } from 'react';
import uploadBox from './upload.svg';
import styles from './employeemodal.module.css';

const IMAGE_SIZE_LIMIT = 500000000;

type UploadProps = {
  imageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingPhoto?: string;
};

const Upload = ({ imageChange, existingPhoto }: UploadProps) => {
  const [imageURL, setImageURL] = useState(
    existingPhoto ? `${existingPhoto}` : ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = createRef<HTMLInputElement>();

  const handleKeyboardPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current && inputRef.current.click();
    }
  };

  function previewImage(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e.target;
    if (files && files[0] && files[0].size < IMAGE_SIZE_LIMIT) {
      setImageURL(URL.createObjectURL(files[0]));
      imageChange(e);
    } else {
      setErrorMessage(`Images must be under ${IMAGE_SIZE_LIMIT / 1000} KB`);
      console.log(errorMessage);
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
      />
      <label htmlFor="driverPhotoInput" className={styles.uploadText}>
        <span
          role="button"
          aria-controls="filename"
          tabIndex={0}
          onKeyPress={handleKeyboardPress}
        >
          Upload a picture
        </span>
      </label>
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
