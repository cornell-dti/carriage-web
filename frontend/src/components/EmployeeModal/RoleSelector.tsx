import React, { ChangeEvent, Dispatch, SetStateAction } from 'react';
import styles from './employeemodal.module.css';
import { Label, Input } from '../FormElements/FormElements';

type Props = {
  selectedRoles: string[];
  setSelectedRoles: Dispatch<SetStateAction<string[]>>;
};

const RoleSelector = ({ selectedRoles, setSelectedRoles }: Props) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const role = e.target.value;
    const checked = e.target.checked;
    setSelectedRoles((prevRoles) =>
      checked ? [...prevRoles, role] : prevRoles.filter((r) => r !== role)
    );
  };

  return (
    <div className={styles.roleSelector}>
      <Label className={styles.roleSelectorTitle} required>
        Role
      </Label>
      <div className={styles.radioGroup}>
        <div className={styles.radioOption}>
          <Input
            className={styles.radioButton}
            id="driver"
            name="role"
            type="checkbox"
            value="driver"
            onChange={onChange}
            checked={selectedRoles.includes('driver')}
          />
          <Label className={styles.driverLabel} htmlFor={'driver'}>
            Driver
          </Label>
        </div>
        <div className={styles.radioOption}>
          <Input
            className={styles.radioButton}
            id="redrunner-admin"
            name="role"
            type="checkbox"
            value="redrunner-admin"
            onChange={onChange}
            checked={selectedRoles.includes('redrunner-admin')}
          />
          <Label className={styles.driverLabel} htmlFor={'redrunner-admin'}>
            Redrunner Admin
          </Label>
        </div>
        <div className={styles.radioOption}>
          <Input
            className={styles.radioButton}
            id="sds-admin"
            name="role"
            type="checkbox"
            value="sds-admin"
            onChange={onChange}
            checked={selectedRoles.includes('sds-admin')}
          />
          <Label className={styles.driverLabel} htmlFor={'sds-admin'}>
            SDS Admin
          </Label>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
