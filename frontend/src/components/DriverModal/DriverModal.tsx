import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useReq } from '../../context/req';
import Modal from '../Modal/Modal';
import { Button } from '../FormElements/FormElements';
import { ObjectType } from '../../types/index';
import DriverInfo from './DriverInfo';
import WorkingHours from './WorkingHours';
import Upload from './Upload';
import styles from './drivermodal.module.css';

const DriverModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageBase64, setImageBase64] = useState('');

  const { withDefaults } = useReq();
  const methods = useForm();

  const openModal = () => setIsOpen(true);

  const closeModal = () => setIsOpen(false);

  const parseAvailability = (availability: ObjectType[]) => {
    const result: ObjectType = {};
    availability.forEach(({ startTime, endTime, days }) => {
      days.forEach((day: string) => {
        result[day] = { startTime, endTime };
      });
    });
    return result;
  };

  const onSubmit = async (data: ObjectType) => {
    const { name, email, phoneNumber, carType, capacity, availability } = data;

    // create vehicle
    const vehicle = { name: carType, capacity: Number(capacity) };
    const vehicleJson = await fetch('/api/vehicles', withDefaults({
      method: 'POST',
      body: JSON.stringify(vehicle),
    }))
      .then((res) => res.json());

    // create driver
    const [firstName, lastName] = name.split(' ');
    const driver = {
      firstName,
      lastName,
      email,
      phoneNumber,
      availability: parseAvailability(availability),
      vehicle: vehicleJson.id
    };
    const createdDriver = await fetch('/api/drivers', withDefaults({
      method: 'POST',
      body: JSON.stringify(driver),
    }))
      .then((res) => res.json());
    
    // upload image
    const photo = { 
      id: createdDriver.id,
      tableName: 'Drivers', 
      fileBuffer: imageBase64 
    };
    const photoJson = await fetch('/api/upload', withDefaults({
      method: 'POST',
      body: JSON.stringify(photo),
    }))
      .then((res) => res.json());

    // update driver photoLink
    fetch(`/api/drivers/${createdDriver.id}`,withDefaults({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoLink: photoJson.fileBuffer }),
      }));

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

  return (
    <>
      <Button onClick={openModal}>+ Add driver</Button>
      <Modal
        title='Add a Driver'
        isOpen={isOpen}
        onClose={closeModal}
      >
        <Upload imageChange={updateBase64}/>
        <FormProvider {...methods} >
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <DriverInfo />
            <WorkingHours />
            <Button className={styles.submit} type='submit'>Add a Driver</Button>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default DriverModal;
