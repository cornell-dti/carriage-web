import React, { useState, createRef } from 'react';
import uploadBox from '../EmployeeModal/upload.svg';

type UploadProps = {
  imageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  existingPhoto?: string;
};

const UploadLocationImage = ({ imageChange, existingPhoto }: UploadProps) => {
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
    e.preventDefault();
    const { files } = e.target;

    // Debugging logs
    console.log('Files object:', files);
    if (files && files[0]) {
      console.log('Selected file:', files[0]);
      console.log('File size:', files[0].size);
    } else {
      console.log('No files selected');
    }
    //End logs

    if (files && files[0] && files[0].size < 500000) {
      const file = files[0];
      const photoURL = URL.createObjectURL(file);
      setImageURL(photoURL);
      // Optionally, call imageChange to pass the file data upwards
      imageChange(e);
    } else {
      console.log('Invalid file');
    }
  }
  
  return (
    <div
      style={{
        position: 'relative',
        alignSelf: 'center',
        textAlign: 'center',
      }}
    >
      {imageURL ? (
        <img
          style={{
            display: 'block',
            marginBottom: '1rem',
            objectFit: 'cover',
            height: '5.875rem',
            width: '5.875rem',
          }}
          alt="uploaded"
          src={imageURL}
        />
      ) : (
        <img
          style={{
            display: 'block',
            marginBottom: '1rem',
            objectFit: 'cover',
            height: '5.875rem',
            width: '5.875rem',
          }}
          alt="profile upload"
          src={uploadBox}
        />
      )}
      <input
        id="locationPhotoInput"
        type="file"
        accept="image/png, image/jpeg"
        style={{ display: 'none' }}
        onChange={previewImage}
      />
      <label
        htmlFor="locationPhotoInput"
        style={{
          margin: '0',
          fontSize: '0.75rem',
          color: '#0057a3',
          cursor: 'pointer',
        }}
      >
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
  )
}

export default UploadLocationImage
