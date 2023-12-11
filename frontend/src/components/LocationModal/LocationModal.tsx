import { parseAddress } from 'addresser';
import { ToastStatus, useToast } from '../../context/toastContext';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Location, ObjectType, Tag } from '../../types/index';
import { Button, Input, Label } from '../FormElements/FormElements';
import Modal from '../Modal/Modal';
import styles from './locationmodal.module.css';
import axios from '../../util/axios';

type LocationModalProps = {
  existingLocation?: Location;
  onAddLocation?: (newLocation: Location) => void;
  onEditLocation?: (editedLocation: Location) => void;
};

const isAddress = (address: string) => {
  let parsedAddr;
  try {
    if (address.includes(',')) {
      parsedAddr = parseAddress(address);
    } else {
      parsedAddr = parseAddress(`${address}, Ithaca, NY 14850`);
    }
  } catch {
    return 'Invalid address';
  }
  const {
    streetNumber,
    streetName,
    streetSuffix,
    placeName,
    stateName,
    zipCode,
  } = parsedAddr;
  if (
    !(
      streetNumber &&
      streetName &&
      streetSuffix &&
      placeName &&
      stateName &&
      zipCode
    )
  ) {
    return 'Invalid address';
  }
  return true;
};

const LocationModal = ({
  existingLocation,
  onAddLocation,
  onEditLocation,
}: LocationModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();
  const { register, handleSubmit, errors, reset } = useForm();
  const { name, address, info } = errors;
  const [formData, setFormData] = useState({
    name: existingLocation?.name || '',
    address: existingLocation?.address || '',
    info: existingLocation?.info || '',
    tag: existingLocation?.tag || 'default', // Replace 'default' with your desired default tag
  });

  const modalTitle = existingLocation ? 'Edit Location' : 'Add a Location';
  const submitButtonText = existingLocation ? 'Save' : 'Save';

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const onSubmit = async (data: ObjectType) => {
    const url = existingLocation
      ? `/api/locations/${existingLocation!.id}`
      : '/api/locations';
    const method = existingLocation ? axios.put : axios.post;

    const newLocation = await method(url, data).then((res) => res.data);

    if (!existingLocation && onAddLocation) {
      onAddLocation(newLocation.data);
      showToast('Location has been added.', ToastStatus.SUCCESS);
    } else if (existingLocation && onEditLocation) {
      onEditLocation(newLocation);
      showToast('Location has been updated.', ToastStatus.SUCCESS);
    }
    closeModal();
  };

  // Clear function to reset form data and errors
  const clearForm = () => {
    setFormData({
      name: '',
      address: '',
      info: '',
      tag: 'default',
    });
    reset();
  };

  return (
    <>
      {existingLocation ? (
        <Button onClick={openModal} outline small>
          Edit
        </Button>
      ) : (
        <Button onClick={openModal}>+ Add a location</Button>
      )}
      <Modal title={modalTitle} isOpen={isOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputContainer}>
            <Label htmlFor="name">Name</Label>
            <Input
              name="name"
              type="text"
              id="name"
              defaultValue={existingLocation?.name}
              className={styles.input}
              ref={register({ required: true })}
              aria-required="true"
            />
            {name && <p className={styles.errorMsg}>Please enter a name</p>}
            <Label htmlFor="address">Address</Label>
            <Input
              name="address"
              type="text"
              id="address"
              defaultValue={existingLocation?.address}
              className={styles.input}
              aria-required="true"
              ref={register({ required: true })}
            />
            {address && <p className={styles.errorMsg}>{address.message}</p>}
            <Label htmlFor="info">Pickup/Dropoff Info</Label>
            <Input
              name="info"
              type="text"
              id="info"
              defaultValue={existingLocation?.info}
              className={styles.input}
              ref={register({ required: true })}
              aria-required="true"
            />
            {info && (
              <p className={styles.errorMsg}>
                Please enter pickup/dropoff info
              </p>
            )}
            <Label htmlFor="tag">Tag</Label>
            <select
              name="tag"
              id="tag"
              defaultValue={existingLocation?.tag}
              ref={register({ required: true })}
              className={styles.inputContainer}
              aria-required="true"
            >
              {Object.values(Tag).map((value) =>
                value === 'custom' ? null : (
                  <option key={value} value={value}>
                    {value}
                  </option>
                )
              )}
            </select>
            <div>
              <Button
                className={styles.clear}
                type="button"
                onClick={clearForm}
              >
                Clear All
              </Button>
              <Button className={styles.submit} type="submit">
                {submitButtonText}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default LocationModal;
