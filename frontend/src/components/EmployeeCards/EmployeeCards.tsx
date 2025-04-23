import { useNavigate } from 'react-router-dom';
import Card, { CardInfo } from '../Card/Card';
import styles from './employeecards.module.css';
import { phone, wheel, user } from '../../icons/userInfo/index';
import { Admin, Driver } from '../../types';

const formatPhone = (phoneNumber: string) => {
  if (!phoneNumber || phoneNumber.length !== 10) return phoneNumber;
  const areaCode = phoneNumber.substring(0, 3);
  const firstPart = phoneNumber.substring(3, 6);
  const secondPart = phoneNumber.substring(6, 10);
  return `${areaCode}-${firstPart}-${secondPart}`;
};

type Employee = Admin | Driver;

function isAdmin(employee: Employee): employee is Admin {
  return 'isDriver' in employee;
}

function isDriver(employee: Employee): employee is Driver {
  return 'availability' in employee && !('isDriver' in employee);
}

type EmployeeCardProps = {
  id: string;
  employee: Employee;
};

const EmployeeCard = ({ id, employee }: EmployeeCardProps) => {
  const navigate = useNavigate();
  const netId = employee.email.split('@')[0];
  const fmtPhone = formatPhone(employee.phoneNumber);

  // Determine if employee is admin, driver, or both
  const adminEmployee = isAdmin(employee);
  const driverEmployee = isDriver(employee);
  const isBoth = adminEmployee && employee.isDriver;

  const roles = (): string => {
    if (isBoth) return 'Admin • Driver';
    if (adminEmployee) return 'Admin';
    return 'Driver';
  };

  const handleClick = () => {
    const path = adminEmployee ? `/admin/admins/${id}` : `/admin/drivers/${id}`;
    navigate(path);
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
          icon={adminEmployee ? user : wheel}
          alt={adminEmployee ? 'admin' : 'wheel'}
        >
          <p>{roles()}</p>
        </CardInfo>
      </Card>
    </div>
  );
};

type EmployeeCardsProps = {
  employees: Employee[];
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