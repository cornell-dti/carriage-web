import { useNavigate } from 'react-router-dom';
import Card, { CardInfo } from '../Card/Card';
import { phone, wheel, user } from '../../icons/userInfo/index';
import { AdminType } from '@carriage-web/shared/types/admin';
import { DriverType } from '@carriage-web/shared/types/driver';

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

type Employee = AdminType | DriverType;

function isAdmin(employee: Employee): employee is AdminType {
  return 'isDriver' in employee;
}

function isDriver(employee: Employee): employee is DriverType {
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
    navigate(`/admin/employees/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer no-underline text-inherit inline-block"
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
    <div className="flex flex-wrap py-4 px-8 gap-8">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} id={employee.id} employee={employee} />
      ))}
    </div>
  );
};

export default EmployeeCards;
