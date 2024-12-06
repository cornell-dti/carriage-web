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

// import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
// import styles from './employeemodal.module.css';
// import { Label, Input } from '../FormElements/FormElements';

// type Props = {
//   selectedRoles: string[];
//   setSelectedRoles: Dispatch<SetStateAction<string[]>>;
// };

// const RoleSelector = ({ selectedRoles, setSelectedRoles }: Props) => {
//   const [roles, setRoles] = useState<string[]>(selectedRoles);

//   const onChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const role = e.target.value;
//     const checked = e.target.checked;
//     const updatedRoles = checked
//       ? [...roles, role]
//       : roles.filter((r) => r !== role);
//     setRoles(updatedRoles);
//     setSelectedRoles(updatedRoles); // Update the parent component state with the selected roles
//   };

//   return (
//     <div className={styles.roleSelector}>
//       <p className={styles.roleSelectorTitle}>Role</p>
//       <div className={styles.radioGroup}>
//         <div className={styles.radioOption}>
//           <Input
//             className={styles.radioButton}
//             id="driver"
//             name="role"
//             type="checkbox"
//             value="driver"
//             onChange={onChange}
//             checked={roles.includes('driver')}
//           />
//           <Label className={styles.driverLabel} htmlFor={'driver'}>
//             Driver
//           </Label>
//         </div>
//         <div className={styles.radioOption}>
//           <Input
//             className={styles.radioButton}
//             id="redrunner-admin"
//             name="role"
//             type="checkbox"
//             value="redrunner-admin"
//             onChange={onChange}
//             checked={roles.includes('redrunner-admin')}
//           />
//           <Label className={styles.driverLabel} htmlFor={'redrunner-admin'}>
//             Redrunner Admin
//           </Label>
//         </div>
//         <div className={styles.radioOption}>
//           <Input
//             className={styles.radioButton}
//             id="sds-admin"
//             name="role"
//             type="checkbox"
//             value="sds-admin"
//             onChange={onChange}
//             checked={roles.includes('sds-admin')}
//           />
//           <Label className={styles.driverLabel} htmlFor={'sds-admin'}>
//             SDS Admin
//           </Label>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoleSelector;
