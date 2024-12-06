import React, { ChangeEvent, Dispatch, SetStateAction } from 'react';
import {
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';

type Props = {
  selectedRoles: string[];
  setSelectedRoles: Dispatch<SetStateAction<string[]>>;
};

const RoleSelector = ({ selectedRoles, setSelectedRoles }: Props) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const role = e.target.value;
    const checked = e.target.checked;
    const updatedRoles = checked
      ? [...selectedRoles, role]
      : selectedRoles.filter((r) => r !== role);
    setSelectedRoles(updatedRoles); // Update the parent component state with the selected roles
  };

  return (
    <FormControl component="fieldset" style={{ marginTop: '16px' }}>
      <Typography variant="h6" style={{ marginBottom: '8px' }}>
        Role
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedRoles.includes('driver')}
              onChange={onChange}
              value="driver"
            />
          }
          label="Driver"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedRoles.includes('redrunner-admin')}
              onChange={onChange}
              value="redrunner-admin"
            />
          }
          label="Redrunner Admin"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedRoles.includes('sds-admin')}
              onChange={onChange}
              value="sds-admin"
            />
          }
          label="SDS Admin"
        />
      </FormGroup>
    </FormControl>
  );
};

export default RoleSelector;
