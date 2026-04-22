import { useNavigate } from 'react-router-dom';
import Card, { CardInfo } from '../Card/Card';
import styles from './employeecards.module.css';
import { phone, wheel, user } from '../../icons/userInfo/index';
import { EmployeeType } from '@carriage-web/shared/types/employee';

const formatPhone = (phoneNumber: string | undefined) => {
  if (phoneNumber !== undefined) {
    const areaCode = phoneNumber.substring(0, 3);
    const firstPart = phoneNumber.substring(3, 6);
    const secondPart = phoneNumber.substring(6, 10);
    return `${areaCode}-${firstPart}-${secondPart}`;
  } else {
    console.error('Undefined PhoneNumber');
    return '';
  }
};

type EmployeeCardProps = {
  id: string;
  employee: EmployeeType;
};

const EmployeeCard = ({ id, employee }: EmployeeCardProps) => {
  const navigate = useNavigate();
  const netId = employee.email.split('@')[0];
  const fmtPhone = formatPhone(employee.phoneNumber);

  const roles = (): string => {
    if (employee.isAdmin && employee.isDriver) return 'Admin • Driver';
    if (employee.isAdmin) return 'Admin';
    return 'Driver';
  };

  const handleClick = () => {
    navigate(`/admin/employees/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      className={styles.link}
    >
      <Card
        firstName={employee.firstName}
        lastName={employee.lastName}
        netId={netId}
        photoLink={employee.photoLink}
      >
        <CardInfo icon={phone} alt="phone">
          <p>{fmtPhone}</p>
        </CardInfo>
        <CardInfo
          icon={employee.isAdmin ? user : wheel}
          alt={employee.isAdmin ? 'admin' : 'wheel'}
        >
          <p>{roles()}</p>
        </CardInfo>
      </Card>
    </div>
  );
};

type EmployeeCardsProps = {
  employees: EmployeeType[];
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
