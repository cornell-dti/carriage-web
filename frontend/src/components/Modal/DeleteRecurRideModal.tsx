import React, { useState } from "react";
import Modal from "./Modal";
import { Ride } from '../../types/index';
import { Button, Input, Label } from '../../components/FormElements/FormElements';
import { useReq } from '../../context/req';

type DeleteSingleRideModalProps = {
    open: boolean,
    ride: Ride,
}

const DeleteRecurRideModal = ({ open, ride }: DeleteSingleRideModalProps) => {
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

    const renderDeleteModal = () => (
        <form onSubmit={confirmCancel}>
            <div>
                <Label htmlFor="single">This Ride Only</Label>
                <Input type='radio' id='single' value='single'/>
            </div>
            <div>
                <Label htmlFor="recurring">All Recurring Rides</Label>
                <Input type='radio' id='recurring' value='recurring'/>
            </div>
            <Button type="button" onClick={closeModal}> Back </Button>
            <Button type="submit"> OK </Button>
        </form>
    )

    return (
        <Modal 
            title='Cancel Recurring Rides'
            isOpen={isOpen}
        >
            {renderDeleteModal()}
        </Modal>
    )
}

export default DeleteRecurRideModal;
