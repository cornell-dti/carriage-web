import React, { ChangeEvent, Dispatch, SetStateAction } from 'react';
import styles from './employeemodal.module.css';
import { Label, Input } from '../FormElements/FormElements';

type Props = {
  selectedRole: string;
  setSelectedRole: Dispatch<SetStateAction<string>>;
}

const RoleSelector = ({ selectedRole, setSelectedRole }: Props) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(e.target.value);
  };

  return (
    <div className={styles.roleSelector}>
      <p className={styles.roleSelectorTitle}>Role</p>
      <div className={styles.radioOption}>
        <Input
          className={styles.radioButton}
          id="driver"
          name="role"
          type="radio"
          value='driver'
          onChange={onChange}
          defaultChecked={selectedRole === 'driver' || true}
        />
        <Label className={styles.driverLabel} htmlFor={'driver'}>Driver</Label>
      </div>
      <div className={styles.radioOption}>
        <Input
          className={styles.radioButton}
          id="admin"
          name="role"
          type="radio"
          value='admin'
          onChange={onChange}
          defaultChecked={selectedRole === 'admin' || false}
        />
        <Label className={styles.driverLabel} htmlFor={'admin'}>Admin</Label>
      </div>
      <div className={styles.radioOption}>
        <Input
          className={styles.radioButton}
          id="both"
          name="role"
          type="radio"
          value='both'
          onChange={onChange}
          defaultChecked={selectedRole === 'both' || false}
        />
        <Label className={styles.driverLabel} htmlFor={'both'}>Both</Label>
      </div>
    </div>
  );
};

export default RoleSelector;
