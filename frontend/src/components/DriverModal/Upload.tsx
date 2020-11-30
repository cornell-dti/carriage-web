import React from 'react';
import uploadBox from './upload.svg';
import styles from './drivermodal.module.css';

const Upload = () => (
  <div className={styles.uploadContainer}>
    <img className={styles.uploadImg} alt="upload box" src={uploadBox} />
    <p className={styles.uploadText}>Upload a picture</p>
  </div>
);

export default Upload;
