import React, { useState } from "react";
import Modal from "./Modal";
import { Ride } from '../../types/index';
import { Button } from '../../components/FormElements/FormElements';
import { useReq } from '../../context/req';
import styles from './deleteModal.module.css';

type DeleteSingleRideModalProps = {
    open: boolean,
    ride: Ride,
}

const DeleteSingleRideModal = ({ open, ride }: DeleteSingleRideModalProps) => {
    const [isOpen, setIsOpen] = useState(open);
    const { withDefaults } = useReq();

    const closeModal = () => {
        setIsOpen(false);
    }

    const confirmCancel = () => {
        fetch(`/api/ride/${ride.id}`, withDefaults({
            method: 'DELETE'
        }))
            .then(_ => closeModal())
    }

    const renderDeleteModal = (ride: Ride) => (
        <div className={styles.modal}>
            <p className={styles.modalText}>Are you sure you want to cancel this ride?</p>
            <div className={styles.buttonContainer}>
                <Button type="button" onClick={closeModal} outline={true}> Back </Button>
                <Button type="button" onClick={confirmCancel} className={styles.redButton}> OK </Button>
            </div>
        </div>
    )

    return (
        <Modal 
            title=''
            isOpen={isOpen}
        >
            {renderDeleteModal(ride)}
        </Modal>
    )
}

export default DeleteSingleRideModal;
