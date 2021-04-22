import React, { useState } from 'react';
import uploadBox from './upload.svg';
import styles from './employeemodal.module.css';

type UploadProps = {
  imageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingPhoto?: string;
}

const Upload = ({ imageChange, existingPhoto }: UploadProps) => {
  const [imageURL, setImageURL] = useState(existingPhoto ? `http://${existingPhoto}` : '');

  function previewImage(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const { files } = e.target;
    if (files && files[0] && files[0].size < 500000) {
      const file = files[0];
      const photoURL = URL.createObjectURL(file);
      setImageURL(photoURL);
    } else {
      console.log('invalid file');
    }
    imageChange(e);
  }

  return (
    <div className={styles.uploadContainer}>
      {imageURL
        ? <img className={styles.uploadImg} alt="uploaded" src={imageURL} />
        : <img className={styles.uploadImg} alt="profile upload" src={uploadBox} />
      }
      <input
        id="driverPhotoInput"
        type="file"
        accept="image/png, image/jpeg"
        style={{ display: 'none' }}
        onChange={(e) => previewImage(e)}
      />
      <label htmlFor="driverPhotoInput" className={styles.uploadText}>
        Upload a picture
      </label>
    </div>
  );
};

export default Upload;
