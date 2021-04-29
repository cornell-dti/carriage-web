import React, { useState, createRef } from 'react';
import uploadBox from './upload.svg';
import styles from './employeemodal.module.css';

type UploadProps = {
  imageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingPhoto?: string;
}

const Upload = ({ imageChange, existingPhoto }: UploadProps) => {
  const [imageURL, setImageURL] = useState(existingPhoto ? `http://${existingPhoto}` : '');
  const inputRef = createRef<HTMLInputElement>();
  /*This is for accessibility purposes only*/
  const handleKeyboardPress = (e: React.KeyboardEvent) =>{
    if( e.key === 'Enter' ){
      inputRef.current && inputRef.current.click();
    }
  };
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
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={(e) => previewImage(e)}
      />
      <label htmlFor="driverPhotoInput" className={styles.uploadText}>
        <span role="button" aria-controls="filename" tabIndex={0} onKeyPress={handleKeyboardPress}>
          Upload a picture</span>
      </label>
    </div>
  );
};

export default Upload;
