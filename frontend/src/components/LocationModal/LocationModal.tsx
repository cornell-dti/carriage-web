import { parseAddress } from 'addresser';
import { ToastStatus, useToast } from '../../context/toastContext';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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

const LocationModal = ({
  existingLocation,
  onAddLocation,
  onEditLocation,
}: LocationModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();
  const { register, handleSubmit, errors, setValue } = useForm();
  const { name, address, info } = errors;

  const modalTitle = existingLocation ? 'Edit Location' : 'Add a Location';
  const submitButtonText = existingLocation ? 'Save' : 'Add Location';

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

  /**
   * Clears location modal's inputs by manually resetting name, address, and
   * info to a blank input. The location's tag resets to 'central'. Avoid using
   * reset() from react hook form because it will reset the form's functionality
   * as well, like the appearance of error messages.
   */
  const onClearAll = () => {
    setValue('name', '');
    setValue('address', '');
    setValue('info', '');
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
            <div style={{ gridArea: 'name' }}>
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
              {name && <p className={styles.errorMsg}>Please input a name</p>}
            </div>

            <div style={{ gridArea: 'address' }}>
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
              {address && (
                <p className={styles.errorMsg}>Please input an address</p>
              )}
            </div>

            <div style={{ gridArea: 'info' }}>
              <Label htmlFor="info">Pickup / Dropoff Information</Label>
              <textarea
                name="info"
                id="info"
                defaultValue={existingLocation?.info}
                className={styles.input}
                ref={register({ required: false })}
                aria-required="false"
                style={{ width: '14rem', height: '6.438rem', resize: 'none' }}
              />
            </div>

            <div style={{ gridArea: 'tag' }}>
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
                {info && <p className={styles.errorMsg}>Please select a tag</p>}
              </select>
            </div>

            <div>
              <Button className={styles.submit} type="submit">
                {submitButtonText}
              </Button>

              <Button type="button" outline={true}>
                Back
              </Button>

              <Button type="reset" outline={true} onClick={onClearAll}>
                <img src={trash}></img>
                <span> Clear All</span>
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default LocationModal;
