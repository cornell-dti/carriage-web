import { parseAddress } from 'addresser';
import { ToastStatus, useToast } from '../../context/toastContext';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const modalTitle = existingLocation ? 'Edit Location' : 'Add a Location';
  const submitButtonText = existingLocation ? 'Save' : 'Add';

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

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
      onEditLocation(newLocation);
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
            <Label htmlFor="name" required>Name</Label>
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

            <Label htmlFor="address" required>Address</Label>
            <Input
              {...register('address', { required: true, validate: isAddress })}
              type="text"
              id="address"
              defaultValue={existingLocation?.address}
              className={styles.input}
              aria-required="true"
            />
            {errors.address && (
              <p className={styles.errorMsg}>{errors.address.message}</p>
            )}

            <Label htmlFor="info" required>Pickup/Dropoff Info</Label>
            <Input
              {...register('info', { required: true })}
              type="text"
              id="info"
              defaultValue={existingLocation?.info}
              className={styles.input}
              aria-required="true"
            />
            {errors.info && (
              <p className={styles.errorMsg}>
                Please enter pickup/dropoff info
              </p>
            )}

            <Label htmlFor="tag" required>Tag</Label>
            <select
              {...register('tag', { required: true })}
              id="tag"
              defaultValue={existingLocation?.tag}
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
