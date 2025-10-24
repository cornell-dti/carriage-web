import { useState } from 'react';
import {
  Box,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  Tooltip,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonOff as DeactivateIcon,
  PersonAdd as ActivateIcon,
} from '@mui/icons-material';
import EmployeeModal from '../../EmployeeModal/EmployeeModal';
import RiderModal from '../../Modal/RiderModal';
import ConfirmationModal from '../../Modal/ConfirmationModal';
import Toast from '../../ConfirmationToast/ConfirmationToast';
import { RiderType } from '@shared/types/rider';
import { DriverType } from '@shared/types/driver';
import { useRiders } from '../../../context/RidersContext';
import { ToastStatus, useToast } from '../../../context/toastContext';
import axios from '../../../util/axios';
import styles from './UserActions.module.css';

type UserRole = 'driver' | 'admin' | 'rider' | 'both';

type EmployeeDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  type?: string[];
  isDriver?: boolean;
  netId: string;
  phoneNumber: string;
  availability?: string[];
  photoLink?: string;
  startDate?: string;
};

type UserActionsProps = {
  role: UserRole;
  employee?: EmployeeDetailProps;
  rider?: RiderType;
  driver?: DriverType;
  isRiderView?: boolean;
};

const UserActions = ({
  role,
  employee,
  rider,
  driver,
  isRiderView,
}: UserActionsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isEmployeeOpen, setEmployeeOpen] = useState(false);
  const [isRiderOpen, setRiderOpen] = useState(false);
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { refreshRiders } = useRiders();
  const { toastType } = useToast();

  const createEmployeeEntity = (employee: EmployeeDetailProps) => {
    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      netId: employee.netId,
      email: `${employee.netId}@cornell.edu`,
      phoneNumber: employee.phoneNumber.replaceAll('-', ''),
      ...(employee.availability || employee.startDate
        ? {
            driver: {
              availability: (employee.availability || []) as any[],
              startDate: employee.startDate || '',
            },
          }
        : {}),
      ...(employee.isDriver !== undefined || employee.type
        ? {
            admin: {
              isDriver: employee.isDriver || false,
              type: employee.type || [],
            },
          }
        : {}),
      photoLink: employee.photoLink,
    };
  };

  const toggleActive = () => {
    if (rider) {
      const { id, active } = rider;
      axios.put(`/api/riders/${id}`, { active: !active }).then(() => {
        setShowToast(true);
        refreshRiders();
      });
    }
  };

  const handleEdit = () => {
    if (employee) {
      setEmployeeOpen(true);
    } else {
      setRiderOpen(true);
    }
  };

  const handleDelete = () => {
    setConfirmationModalIsOpen(true);
  };

  const getActivateButtonText = () => {
    if (!rider) return '';
    return rider.active ? 'Deactivate' : 'Activate';
  };

  const getActivateButtonIcon = () => {
    if (!rider) return <ActivateIcon />;
    return rider.active ? <DeactivateIcon /> : <ActivateIcon />;
  };

  return (
    <Card className={styles.actionsContainer} elevation={2}>
      <CardContent className={styles.actionsCardContent}>
        <Typography variant="h6" className={styles.actionsHeader}>
          Actions
        </Typography>

        <Box className={styles.buttonsContainer}>
          {showToast && rider && (
            <Toast
              message={`Rider ${rider.active ? 'activated' : 'deactivated'}.`}
              toastType={toastType ? ToastStatus.SUCCESS : ToastStatus.ERROR}
            />
          )}

          {/* Activate/Deactivate Button for Riders */}
          {rider && (
            <>
              {isMobile ? (
                <Tooltip title={getActivateButtonText()}>
                  <IconButton
                    onClick={toggleActive}
                    className={styles.actionButton}
                    color={rider.active ? 'error' : 'success'}
                  >
                    {getActivateButtonIcon()}
                  </IconButton>
                </Tooltip>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={getActivateButtonIcon()}
                  onClick={toggleActive}
                  className={styles.activateButton}
                  color={rider.active ? 'error' : 'success'}
                >
                  {getActivateButtonText()}
                </Button>
              )}
            </>
          )}

          {/* Edit Button */}
          {isMobile ? (
            <Tooltip title="Edit">
              <IconButton
                onClick={handleEdit}
                className={styles.actionButton}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              className={styles.editButton}
            >
              Edit
            </Button>
          )}

          {/* Delete Button */}
          {isMobile ? (
            <Tooltip title="Delete">
              <IconButton
                onClick={handleDelete}
                className={styles.actionButton}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              className={styles.deleteButton}
              color="error"
            >
              Delete
            </Button>
          )}
        </Box>

        {/* Modals */}
        {employee && (
          <EmployeeModal
            existingEmployee={createEmployeeEntity(employee)}
            isOpen={isEmployeeOpen}
            setIsOpen={setEmployeeOpen}
          />
        )}

        {rider && (
          <RiderModal
            existingRider={rider}
            isRiderWeb={isRiderView}
            isOpen={isRiderOpen}
            setIsOpen={setRiderOpen}
          />
        )}

        <ConfirmationModal
          open={confirmationModalIsOpen}
          user={driver || employee || rider!}
          onClose={() => setConfirmationModalIsOpen(false)}
          role={role}
        />
      </CardContent>
    </Card>
  );
};

export default UserActions;
