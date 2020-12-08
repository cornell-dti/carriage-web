import React from 'react';
import uploadBox from './upload.svg';
import styles from './drivermodal.module.css';

const Upload = () => (
  <div className={styles.uploadContainer}>
    <img className={styles.uploadImg} alt="profile upload" src={uploadBox} />
    <input
      id="driverPhotoInput"
      type="file"
      accept="image/png, image/jpeg"
      style={{ display: 'none' }}
    />
    <label htmlFor="driverPhotoInput" className={styles.uploadText}>
      Upload a picture
    </label>
  </div>
);

export default Upload;
