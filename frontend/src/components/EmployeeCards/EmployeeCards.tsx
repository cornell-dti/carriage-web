import { useNavigate } from 'react-router-dom';
import Card, { CardInfo } from '../Card/Card';
import styles from './employeecards.module.css';
import { phone, wheel, user } from '../../icons/userInfo/index';
import { Employee } from '../../types';
import { AdminType, DriverType } from '../../types';

const formatPhone = (phoneNumber: string) => {
  const areaCode = phoneNumber.substring(0, 3);
  const firstPart = phoneNumber.substring(3, 6);
  const secondPart = phoneNumber.substring(6, 10);
  return `${areaCode}-${firstPart}-${secondPart}`;
};

type EmployeeCardProps = {
  id: string;
  employee: Employee;
};

const EmployeeCard = ({
  id,
  employee: {
    firstName,
    lastName,
    email,
    type,
    isDriver,
    phoneNumber,
    availability,
    photoLink,
    startDate,
  },
}: EmployeeCardProps) => {
  const navigate = useNavigate();
  const netId = email.split('@')[0];
  const fmtPhone = formatPhone(phoneNumber);
  const formatAvail = (availability: {
    [key: string]: { startTime: string; endTime: string };
  }) => {
    if (!availability) {
      return 'N/A';
    }

    return Object.entries(availability)
      .filter(([_, timeRange]) => timeRange?.startTime && timeRange?.endTime)
      .map(
        ([day, timeRange]) =>
          `${day}: ${timeRange.startTime} - ${timeRange.endTime}`
      )
      .join('\n ');
  };

  const isAdmin = isDriver !== undefined;
  const isBoth = isDriver && isDriver == true;
  const roles = (): string => {
    if (isBoth) return 'Admin • Driver';
    if (isAdmin) return 'Admin';
    return 'Driver';
  };

  const handleClick = () => {
    const path =
      isAdmin || isBoth ? `/admin/admins/${id}` : `/admin/drivers/${id}`;
    navigate(path);
  };

  return (
    <div
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      className={styles.link}
    >
      <Card
        firstName={firstName}
        lastName={lastName}
        netId={netId}
        photoLink={photoLink}
      >
        <CardInfo icon={phone} alt="phone">
          <p>{fmtPhone}</p>
        </CardInfo>
        <CardInfo
          icon={isAdmin || isBoth ? user : wheel}
          alt={isAdmin || isBoth ? 'admin' : 'wheel'}
        >
          <p>{roles()}</p>
        </CardInfo>
      </Card>
    </div>
  );
};

type EmployeeCardsProps = {
  employees: (AdminType | DriverType)[];
};

const EmployeeCards = ({ employees }: EmployeeCardsProps) => {
  return (
    <div className={styles.cardsContainer}>
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} id={employee.id} employee={employee} />
      ))}
    </div>
  );
};

export default EmployeeCards;
