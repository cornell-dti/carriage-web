import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import Modal from "./Modal";
import { Button } from "../FormElements/FormElements";
import { ObjectType, Rider } from "../../types/index";
import Toast from "../ConfirmationToast/ConfirmationToast";
import RiderModalInfo from "./RiderModalInfo";
import styles from "./ridermodal.module.css";
import { useReq } from "../../context/req";
import { useRiders } from "../../context/RidersContext";

type RiderModalProps = {
  riders: Array<Rider>;
  setRiders: Dispatch<SetStateAction<Rider[]>>;
};

const RiderModal = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    accessibility: [],
    joinDate: "",
    endDate: "",
    address: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showingToast, setToast] = useState(false);
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
    setToast(false);
    setIsSubmitted(true);
    closeModal();
  };

  useEffect(() => {
    if (isSubmitted) {
      const newRider = {
        ...formData,
      };
      fetch(
        "/api/riders",
        withDefaults({
          method: "POST",
          body: JSON.stringify(newRider),
        })
      ).then(() => {
        refreshRiders();
        setToast(true);
      });
      setIsSubmitted(false);
    }
  }, [formData, isSubmitted, refreshRiders, withDefaults]);

  return (
    <>
      {showingToast ? <Toast message="The student has been added." /> : null}
      <Button className={styles.addRiderButton} onClick={openModal}>
        + Add Student
      </Button>
      <Modal
        title={["Add a student"]}
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
