import React, { useState } from "react";
import Modal from "./Modal";
import { Ride } from '../../types/index';
import { Button } from '../../components/FormElements/FormElements';
import { useReq } from '../../context/req';

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
        <div>
            <p>Are you sure you want to cancel this ride?</p>
            <Button type="button" onClick={closeModal}> Back </Button>
            <Button type="button" onClick={confirmCancel}> OK </Button>
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
