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
import { RiderType } from '@carriage-web/shared/types/rider';
import { DriverType } from '@carriage-web/shared/types/driver';
import { useRiders } from '../../../context/RidersContext';
import { ToastStatus, useToast } from '../../../context/toastContext';
import axios from '../../../util/axios';

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

  const actionButtonClass =
    'min-w-12 h-12 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] max-md:min-w-11 max-md:h-11';
  const baseButtonClass =
    'py-2.5 px-4 rounded-lg normal-case font-medium min-h-10 shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]';

  return (
    <Card
      className="w-full rounded-xl h-fit flex flex-col max-md:flex-row max-md:justify-center max-md:items-center max-md:gap-2"
      elevation={2}
    >
      <CardContent className="p-6 flex flex-col gap-4">
        <Typography
          variant="h6"
          className="text-lg font-semibold text-[#333] mb-2"
        >
          Actions
        </Typography>

        <Box className="flex flex-col gap-3 items-stretch">
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
                    className={actionButtonClass}
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
                  className={`${baseButtonClass} bg-white`}
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
                className={actionButtonClass}
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
              className={`${baseButtonClass} bg-white border-[#1976d2] text-[#1976d2] hover:bg-[rgba(25,118,210,0.04)]`}
            >
              Edit
            </Button>
          )}

          {/* Delete Button */}
          {isMobile ? (
            <Tooltip title="Delete">
              <IconButton
                onClick={handleDelete}
                className={actionButtonClass}
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
              className={`${baseButtonClass} bg-white border-[#d32f2f] text-[#d32f2f] hover:bg-[rgba(211,47,47,0.04)]`}
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
