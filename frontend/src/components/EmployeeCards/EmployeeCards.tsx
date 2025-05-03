import { useNavigate } from 'react-router-dom';
import Card, { CardInfo } from '../Card/Card';
import styles from './employeecards.module.css';
import { phone, wheel, user } from '../../icons/userInfo/index';
import { Admin, Driver } from '../../types';

/**
 * Formats a 10-digit phone number as `XXX-XXX-XXXX`.
 * @param phoneNumber - A string representing a 10-digit phone number.
 * @returns The formatted phone number or the original input if invalid.
 */
const formatPhone = (phoneNumber: string) => {
  if (!phoneNumber || phoneNumber.length !== 10) return phoneNumber;
  const areaCode = phoneNumber.substring(0, 3);
  const firstPart = phoneNumber.substring(3, 6);
  const secondPart = phoneNumber.substring(6, 10);
  return `${areaCode}-${firstPart}-${secondPart}`;
};

type Employee = Admin | Driver;

/**
 * Type guard to check if an employee is an Admin.
 * @param employee - The employee object to check.
 * @returns True if the employee is an Admin.
 */
function isAdmin(employee: Employee): employee is Admin {
  return 'type' in employee;
}

/**
 * Type guard to check if an employee is a Driver.
 * @param employee - The employee object to check.
 * @returns True if the employee is a Driver.
 */
function isDriver(employee: Employee): employee is Driver {
  return !isAdmin(employee);
}

type EmployeeCardProps = {
  id: string;
  employee: Employee;
};

const EmployeeCard = ({ id, employee }: EmployeeCardProps) => {
  const navigate = useNavigate();
  const netId = employee.email.split('@')[0];
  const fmtPhone = formatPhone(employee.phoneNumber);

  // const isEDriver = isDriver(employee);
  const isEAdmin = isAdmin(employee);

  const role = (): string | undefined => {
    if (isEAdmin) {
      return 'Admin';
    } else {
      return 'Driver';
    }
  };

  const handleClick = () => {
    const path = isEAdmin ? `/admin/admins/${id}` : `/admin/drivers/${id}`;
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
          icon={isEAdmin ? user : wheel}
          alt={isEAdmin ? 'admin' : 'wheel'}
        >
          <p>{role()}</p>
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
