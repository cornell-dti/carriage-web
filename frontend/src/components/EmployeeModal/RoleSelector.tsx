import React, { ChangeEvent, Dispatch, SetStateAction } from 'react';
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
    <div roleSelector}>
      <p roleSelectorTitle}>Role</p>
      <div radioGroup}>
        <div radioOption}>
          <Input
            radioButton}
            id="driver"
            name="role"
            type="checkbox"
            value="driver"
            onChange={onChange}
            checked={selectedRoles.includes('driver')}
          />
          <Label driverLabel} htmlFor={'driver'}>
            Driver
          </Label>
        </div>
        <div radioOption}>
          <Input
            radioButton}
            id="redrunner-admin"
            name="role"
            type="checkbox"
            value="redrunner-admin"
            onChange={onChange}
            checked={selectedRoles.includes('redrunner-admin')}
          />
          <Label driverLabel} htmlFor={'redrunner-admin'}>
            Redrunner Admin
          </Label>
        </div>
        <div radioOption}>
          <Input
            radioButton}
            id="sds-admin"
            name="role"
            type="checkbox"
            value="sds-admin"
            onChange={onChange}
            checked={selectedRoles.includes('sds-admin')}
          />
          <Label driverLabel} htmlFor={'sds-admin'}>
            SDS Admin
          </Label>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
