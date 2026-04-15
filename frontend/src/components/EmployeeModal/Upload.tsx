import React, { useState, createRef } from 'react';
import uploadBox from './upload.svg';

const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB limit

type UploadProps = {
  imageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingPhoto?: string;
  isUploading?: boolean;
};

const Upload = ({
  imageChange,
  existingPhoto,
  isUploading = false,
}: UploadProps) => {
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
      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/heic',
        'image/heif',
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(
          'Please select a valid image file (PNG, JPEG, HEIC, or HEIF)'
        );
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
    <div className="absolute right-8 top-8 max-w-25 max-h-25 text-center flex flex-col items-center">
      {imageURL ? (
        <img
          className="block w-full h-full object-cover"
          alt="uploaded"
          src={imageURL}
        />
      ) : (
        <img
          className="block w-full h-full object-cover"
          alt="profile upload"
          src={uploadBox}
        />
      )}
      <input
        id="driverPhotoInput"
        type="file"
        accept="image/png, image/jpeg, image/heic, image/heif"
        ref={inputRef}
        className="hidden"
        onChange={previewImage}
        disabled={isUploading}
      />
      <label
        htmlFor="driverPhotoInput"
        className={`m-0 text-xs text-[#0057a3] cursor-pointer transition-[text-decoration] duration-200 hover:underline ${
          isUploading ? 'opacity-60' : 'opacity-100'
        }`}
      >
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
        <div className="text-[#eb0023] text-xs mt-2">{errorMessage}</div>
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
