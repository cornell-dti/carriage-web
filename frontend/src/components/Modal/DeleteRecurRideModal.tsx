import React, { useState } from "react";
import Modal from "./Modal";
import { Ride } from '../../types/index';
import { Button, Input, Label } from '../../components/FormElements/FormElements';
import styles from './deleteModal.module.css';

type DeleteSingleRideModalProps = {
    open: boolean,
    ride: Ride,
}

const DeleteRecurRideModal = ({ open, ride }: DeleteSingleRideModalProps) => {
    const [isOpen, setIsOpen] = useState(open);
    const [cancelSingle, setCancelSingle] = useState(false);

    const changeSelection = (e: any) => {
        if (e.target.value === 'single') setCancelSingle(true);
        else setCancelSingle(false);
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    // TODO
    const confirmCancel = () => {
        console.log('deleted')
    }

    const renderDeleteModal = () => (
        <form onSubmit={confirmCancel}>
            <div>
                <Input type='radio' id='single' name='rideType' value='single' 
                    onClick={(e) => changeSelection(e)}/>
                <Label htmlFor="single" className={styles.modalText}>This Ride Only</Label>
            </div>
            <div>
                <Input type='radio' id='recurring' name='rideType' value='recurring'
                    onClick={(e) => changeSelection(e)}/>
                <Label htmlFor="recurring" className={styles.modalText}>All Recurring Rides</Label>
            </div>
            <div className={styles.buttonContainer}>
                <Button type="button" onClick={closeModal} outline={true}> Back </Button>
                <Button type="submit" className={styles.redButton}> OK </Button>
            </div>
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
