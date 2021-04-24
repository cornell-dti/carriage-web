import React, { ChangeEvent, Dispatch, SetStateAction } from 'react';
import styles from './locationmodal.module.css';
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
          name="driver"
          type="radio"
          value='driver'
          onChange={onChange}
          checked={selectedRole === 'driver'}
        />
        <Label className={styles.driverLabel}>Driver</Label>
      </div>
      <div className={styles.radioOption}>
        <Input
          name="admin"
          type="radio"
          value='admin'
          onChange={onChange}
          checked={selectedRole === 'admin'}
        />
        <Label className={styles.driverLabel}>Admin</Label>
      </div>
      <div className={styles.radioOption}>
        <Input
          name="both"
          type="radio"
          value='both'
          onChange={onChange}
          checked={selectedRole === 'both'}
        />
        <Label className={styles.driverLabel}>Both</Label>
      </div>
    </div>
  );
};

export default RoleSelector;
