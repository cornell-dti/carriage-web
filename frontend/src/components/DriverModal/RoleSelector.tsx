import React, { ChangeEvent, useEffect, useState } from 'react';
import cn from 'classnames';
import { useFormContext } from 'react-hook-form';
import styles from './drivermodal.module.css';
import { Label, Input } from '../FormElements/FormElements';

const RoleSelector = () => {
  const { register } = useFormContext();
  const [selectedRole, setSelectedRole] = useState('driver');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(e.target.value)
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
          checked={selectedRole === "driver"}
        />
        <Label className={styles.driverLabel}>Driver</Label>
      </div>
      <div className={styles.radioOption}>
        <Input
          name="admin"
          type="radio"
          value='admin'
          onChange={onChange}
          checked={selectedRole === "admin"}
        />
        <Label className={styles.driverLabel}>Admin</Label>
      </div>
      <div className={styles.radioOption}>
        <Input
          name="both"
          type="radio"
          value='both'
          onChange={onChange}
          checked={selectedRole === "both"}
        />
        <Label className={styles.driverLabel}>Both</Label>
      </div>
    </div>
  );
};

export default RoleSelector;
