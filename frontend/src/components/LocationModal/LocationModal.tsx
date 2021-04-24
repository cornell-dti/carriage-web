import { parseAddress } from 'addresser';
import cn from 'classnames';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useReq } from '../../context/req';
import { Location, ObjectType, Tag } from '../../types/index';
import Toast from '../ConfirmationToast/ConfirmationToast';
import { Button, Input } from '../FormElements/FormElements';
import Modal from '../Modal/Modal';
import styles from './locationmodal.module.css';

type LocationModalProps = {
  existingLocation?: Location
  onAddLocation?: (newLocation: Location) => void
  onEditLocation?: (editedLocation: Location) => void
}

const isAddress = (address: string) => {
  let parsedAddr;
  try {
    parsedAddr = parseAddress(address);
  } catch {
    return 'Invalid address';
  }
  const {
    streetNumber, streetName, streetSuffix, placeName, stateName, zipCode,
  } = parsedAddr;

  if (!(streetNumber && streetName && streetSuffix && placeName && stateName && zipCode)) {
    return 'Invalid address';
  }
  return true;
};

const LocationModal = ({ existingLocation, onAddLocation, onEditLocation }: LocationModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showingToast, setToast] = useState(false);
  const { register, handleSubmit, errors } = useForm();
  const { address } = errors;
  const { withDefaults } = useReq();

  const modalTitle = existingLocation ? 'Edit Location' : 'Add a Location';
  const submitButtonText = existingLocation ? 'Save' : 'Add';

  const openModal = () => {
    setIsOpen(true);
    setToast(false);
  };

  const closeModal = () => setIsOpen(false);

  const onSubmit = async (data: ObjectType) => {
    const url = existingLocation
      ? `/api/locations/${existingLocation!.id}`
      : '/api/locations';
    const method = existingLocation
      ? 'PUT'
      : 'POST';

    const newLocation = await fetch(url, withDefaults({
      method,
      body: JSON.stringify(data),
    })).then((res) => res.json());

    if (!existingLocation && onAddLocation) {
      onAddLocation(newLocation);
    } else if (existingLocation && onEditLocation) {
      onEditLocation(newLocation);
    }

    setToast(true);
    closeModal();
  };

  return (
    <>
      {existingLocation
        ? <Button onClick={openModal} outline>Edit</Button>
        : <Button onClick={openModal}>+ Add a location</Button>
      }
      {showingToast ? <Toast message={existingLocation ? 'Location has been updated.' : 'Location has been added.'} /> : null}
      <Modal
        title={modalTitle}
        isOpen={isOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={cn(styles.inputContainer)}>
            <select
              name='tag'
              ref={register({ required: true })}
              className={cn(styles.styledSelect)}
            >
              {Object.values(Tag).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <Input
              name='name'
              type='text'
              placeholder='Name'
              defaultValue={existingLocation?.name}
              className={cn(styles.input)}
              ref={register({ required: true })}
            />
            <Input
              name='address'
              type='text'
              placeholder='Address'
              defaultValue={existingLocation?.address}
              className={cn(styles.input)}
              ref={register({ required: true, validate: isAddress })}
            />
            {address && address.message && <p className={cn(styles.errorMsg)}>{address?.message}</p>}
            <div>
              <Button className={styles.submit} type='submit'>
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
