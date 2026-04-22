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
    <div className="mb-6">
      <p className="mb-2 font-medium">Role</p>
      <div className="flex gap-4">
        <div className="flex items-center gap-1">
          <Input
            className="cursor-pointer focus:outline-2 focus:outline-black"
            id="driver"
            name="role"
            type="checkbox"
            value="driver"
            onChange={onChange}
            checked={selectedRoles.includes('driver')}
          />
          <Label htmlFor={'driver'}>Driver</Label>
        </div>
        <div className="flex items-center gap-1">
          <Input
            className="cursor-pointer focus:outline-2 focus:outline-black"
            id="redrunner-admin"
            name="role"
            type="checkbox"
            value="redrunner-admin"
            onChange={onChange}
            checked={selectedRoles.includes('redrunner-admin')}
          />
          <Label htmlFor={'redrunner-admin'}>Redrunner Admin</Label>
        </div>
        <div className="flex items-center gap-1">
          <Input
            className="cursor-pointer focus:outline-2 focus:outline-black"
            id="sds-admin"
            name="role"
            type="checkbox"
            value="sds-admin"
            onChange={onChange}
            checked={selectedRoles.includes('sds-admin')}
          />
          <Label htmlFor={'sds-admin'}>SDS Admin</Label>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
