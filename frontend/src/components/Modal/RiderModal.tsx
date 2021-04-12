import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Modal from './Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType, Rider } from '../../types/index';
import RiderModalInfo from './RiderModalInfo';
import styles from './ridermodal.module.css';
import { useReq } from '../../context/req';
import { useRiders } from '../../context/RidersContext';


type RiderModalProps = {
  riders: Array<Rider>;
  setRiders: Dispatch<SetStateAction<Rider[]>>;
}

const RiderModal = () => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    accessibility: [],
    description: '',
    joinDate: '',
    endDate: '',
    pronouns: '',
    address: '',
    favoriteLocations: [],
    organization: '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imageBase64, setImageBase64] = useState('');
  const [photoJson, setPhotoJson] = useState<any>(null);
  const { withDefaults } = useReq();
  const { refreshRiders } = useRiders();

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const saveDataThen = (next: () => void) => (data: ObjectType) => {
    setFormData((prev) => ({ ...prev, ...data }));
    next();
  };

  const submitData = () => {
    setIsSubmitted(true);
    closeModal();
  };

  function updateBase64(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      let file = e.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = function () {
      let res = reader.result;
        if (res) {
          res = res.toString();
          // remove "data:image/png;base64," and "data:image/jpeg;base64,"
          let strBase64 = res.toString().substring(res.indexOf(",") + 1);
          setImageBase64(strBase64);
        }
      };
      reader.onerror = function (error) {
        console.log('Error reading file: ', error);
      };  
    } else {
      console.log('Undefined file upload');
    }
  };

  const uploadImage = async () => {
    const photo = { 
      id: formData.id,
      tableName: 'Riders', 
      fileBuffer: imageBase64 
    };
    const uploadedImage = await fetch('/api/upload', withDefaults({
      method: 'POST',
      body: JSON.stringify(photo),
    })).then((res) => res.json());

    setPhotoJson(uploadedImage);
  }

  useEffect(() => {
    if (isSubmitted) {
      if (imageBase64 !== '') {
        uploadImage();
      };

      const newRider = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        accessibility: formData.accessibility,
        description: '',
        joinDate: '',
        pronouns: '',
        address: formData.address,
        favoriteLocations: [],
        organization: '',
        photoLink: photoJson.fileBuffer
      };
      fetch('/api/riders', withDefaults({
        method: 'POST',
        body: JSON.stringify(newRider),
      })).then(() => refreshRiders());
      setIsSubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, isSubmitted, refreshRiders, withDefaults]);

  return (
    <>
      <Button className={styles.addRiderButton} onClick={openModal}>+ Add Student</Button>
      <Modal
        title={['Add a student']}
        isOpen={isOpen}
        currentPage={0}
        onClose={closeModal}
      >
        <RiderModalInfo onSubmit={saveDataThen(submitData)} />
      </Modal>
    </>
  );
};

export default RiderModal;
