import { parseAddress } from 'addresser';
import { ToastStatus, useToast } from '../../context/toastContext';
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Location, ObjectType, Tag } from '../../types/index';
import { Button, Input, Label } from '../FormElements/FormElements';
import Modal from '../Modal/Modal';
import styles from './locationmodal.module.css';
import axios from '../../util/axios';
import { trash } from '../../icons/other';

type LocationModalProps = {
  existingLocation?: Location;
  onAddLocation?: (newLocation: Location) => void;
  onEditLocation?: (editedLocation: Location) => void;
};

type FormData = {
  name: string;
  address: string;
  info: string;
  tag: Tag;
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

const LocationModal: React.FC<LocationModalProps> = ({
  existingLocation,
  onAddLocation,
  onEditLocation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();
  const { register, handleSubmit, reset, formState } = useForm<FormData>();
  const { errors } = formState;

  const modalTitle = existingLocation ? 'Edit Location' : 'Add a Location';
  const submitButtonText = existingLocation ? 'Save Locaation' : 'Add Location';

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    reset();
    setIsOpen(false);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const url = existingLocation
      ? `/api/locations/${existingLocation.id}`
      : '/api/locations';

    const method = existingLocation ? axios.put : axios.post;

    const newLocation = await method(url, data).then((res) => res.data);

    if (!existingLocation && onAddLocation) {
      onAddLocation(newLocation.data);
      showToast('Location has been added.', ToastStatus.SUCCESS);
    } else if (existingLocation && onEditLocation) {
      onEditLocation(newLocation.data);
      showToast('Location has been updated.', ToastStatus.SUCCESS);
    }

    closeModal();
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
      <Modal
        title={modalTitle}
        isOpen={isOpen}
        onClose={closeModal}
        id="location-modal"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          aria-labelledby="location-modal"
        >
          <div className={styles.inputContainer}>
            <div className={styles.col1}>
              <Label htmlFor="name">Name</Label>
              <Input
                {...register('name', { required: true })}
                type="text"
                id="name"
                defaultValue={existingLocation?.name}
                className={styles.input}
                aria-required="true"
              />
              {errors.name && (
                <p className={styles.errorMsg}>Please enter a name</p>
              )}
            </div>

            <div className={styles.col2}>
              <Label htmlFor="address">Address</Label>
              <Input
                {...register('address', {
                  required: 'Please enter an address',
                  validate: isAddress,
                })}
                type="text"
                id="address"
                defaultValue={existingLocation?.address}
                className={styles.input}
                aria-required="true"
              />
              {errors.address && (
                <p className={styles.errorMsg}>{errors.address.message}</p>
              )}
            </div>

            <div className={styles.col1}>
              <Label htmlFor="info">Pickup/Dropoff Info</Label>
              <textarea
                {...register('info', { required: true })}
                id="info"
                defaultValue={existingLocation?.info}
                className={styles.input}
                aria-required="true"
              ></textarea>

              {errors.info && (
                <p className={styles.errorMsg}>
                  Please enter pickup/dropoff info
                </p>
              )}
            </div>

            <div className={styles.col2}>
              <Label htmlFor="tag">Tag</Label>
              <select
                {...register('tag', {
                  required: 'Select a Tag',
                })}
                id="tag"
                defaultValue={existingLocation?.tag || ''}
                className={styles.inputContainer}
                aria-required="true"
                style={{ height: '40px' }}
              >
                <option value="" disabled>
                  Select a tag
                </option>
                {Object.values(Tag).map((value) =>
                  value === Tag.CUSTOM ? null : (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                )}
              </select>
              {errors.tag && (
                <p className={styles.errorMsg}>Please select a tag</p>
              )}
            </div>
          </div>
          <div className={styles.locationButtons}>
            <Button className={styles.submit} type="submit">
              {submitButtonText}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default LocationModal;
