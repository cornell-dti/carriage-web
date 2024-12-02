import React, { useState, createRef } from 'react';
import uploadBox from './upload.svg';
import styles from './employeemodal.module.css';
//import { useToast, ToastStatus } from '../../context/toastContext';


const IMAGE_SIZE_LIMIT = 50000;

type UploadProps = {
  imageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingPhoto?: string;
};

const Upload = ({ imageChange, existingPhoto }: UploadProps) => {
  //const { showToast } = useToast();
  const [imageURL, setImageURL] = useState(
    existingPhoto ? `${existingPhoto}` : ''
  );
  const inputRef = createRef<HTMLInputElement>();

  /* This is for accessibility purposes only */
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
      alert(`Images must be under ${IMAGE_SIZE_LIMIT} MB`) // works but not preferred.
      //showToast(`Images must be under ${IMAGE_SIZE_LIMIT} MB`, ToastStatus.ERROR) : The ideal version but does not work. 
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
        accept="image/png, image/jpeg"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={(e) => previewImage(e)}
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
