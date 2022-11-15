import React, { useState } from 'react';
import { DayValue, Day } from 'react-modern-calendar-datepicker';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '../FormElements/FormElements';
import Modal from '../Modal/Modal';
import CalendarPicker from './CalendarPickerModal';

const CalandarModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const methods = useForm();
  const modalTitle = 'Select Day';

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    methods.clearErrors();
    setIsOpen(false);
  };
  return (
    <>
      <Button onClick={openModal}>Select Date</Button>
      <Modal title={modalTitle} isOpen={isOpen} onClose={closeModal}>
        <CalendarPicker />
      </Modal>
    </>
  );
};

export default CalandarModal;
