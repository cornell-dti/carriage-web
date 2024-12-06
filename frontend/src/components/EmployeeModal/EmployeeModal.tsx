import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Grid,
  Typography,
} from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { ObjectType } from '../../types/index';
import { useEmployees } from '../../context/EmployeesContext';
import { useToast, ToastStatus } from '../../context/toastContext';
import StartDate from './StartDate';
import WorkingHours from './WorkingHours';
import Upload from './Upload';
import axios from '../../util/axios';
import RoleSelector from './RoleSelector';
import EmployeeInfo from './EmployeeInfo';

// type EmployeeModalProps = {
//   existingEmployee?: {
//     id?: string;
//     firstName?: string;
//     lastName?: string;
//     type?: string[];
//     isDriver?: boolean;
//     netId?: string;
//     email?: string;
//     phone?: string;
//     availability?: string[][];
//     startDate?: string;
//     photoLink?: string;
//   };
//   isOpen: boolean;
//   setIsOpen: any; //(open: boolean) => void;
// };

// type AdminData = {
//   id?: string;
//   firstName: any;
//   lastName: any;
//   type: string[];
//   isDriver: boolean;
//   email: any;
//   phoneNumber: any;
// };

// type DriverData = {
//   id?: string;
//   firstName: any;
//   lastName: any;
//   email: any;
//   phoneNumber: any;
//   availability: ObjectType;
// };

// const EmployeeModal = ({
//   existingEmployee,
//   isOpen,
//   setIsOpen,
// }: EmployeeModalProps) => {
//   const { showToast } = useToast();
//   if (existingEmployee?.isDriver !== undefined) {
//     if (existingEmployee.isDriver) {
//       existingEmployee?.type?.push('driver');
//     }
//   } else if (existingEmployee) {
//     existingEmployee.type = existingEmployee?.type || ['driver'];
//   }
//   const { refreshAdmins, refreshDrivers } = useEmployees();
//   //const methods = useForm();
//   const [selectedRole, setSelectedRole] = useState<string[]>(
//     existingEmployee?.type || []
//   );
//   const [imageBase64, setImageBase64] = useState('');
//   const methods = useForm();
//   // const [startDate, setStartDate] = useState<string | null>(
//   //   existingEmployee?.startDate || null
//   // );
//   // const [availability, setAvailability] = useState<
//   //   { day: string; startTime: string | null; endTime: string | null }[]
//   // >(existingEmployee?.availability || []);

//   const modalTitle = existingEmployee ? 'Edit Profile' : 'Add an Employee';
//   const submitButtonText = existingEmployee ? 'Save' : 'Add';

//   const closeModal = () => {
//     methods.clearErrors();
//     setIsOpen(false);
//   };

//   /**
//    * Converts availabilities expressed as an array of {starTime, endTime, days}
//    * objects into an object mapping the day to the start and end time of each
//    * availability period
//    *
//    * @param availability the availibity array to convert
//    * @returns the availibity array expressed as an object mapping the day to
//    * the start and end time of each availibility period
//    */
//   const parseAvailability = (availability: ObjectType[]) => {
//     const result: ObjectType = {};
//     availability.forEach(({ startTime, endTime, days }) => {
//       days.forEach((day: string) => {
//         result[day] = { startTime, endTime };
//       });
//     });
//     return result;
//   };

//   const uploadPhotoForEmployee = async (
//     employeeId: string,
//     table: string,
//     refresh: () => Promise<void>,
//     isCreate: boolean // show toast if new employee is created
//   ) => {
//     const photo = {
//       id: employeeId,
//       tableName: table,
//       fileBuffer: imageBase64,
//     };
//     // Upload image
//     await axios
//       .post('/api/upload', photo)
//       .then(() => {
//         refresh();
//       })
//       .catch((err) => console.log(err));
//   };

//   const createNewEmployee = async (
//     employeeData: AdminData | DriverData,
//     endpoint: string,
//     refresh: () => Promise<void>,
//     table: string
//   ) => {
//     const res = await axios.post(endpoint, employeeData);
//     if (imageBase64 === '') {
//       // If no image has been uploaded, create new employee
//       refresh();
//       showToast('The employee has been added.', ToastStatus.SUCCESS);
//     } else {
//       const { data: createdEmployee } = await res.data;
//       uploadPhotoForEmployee(createdEmployee.id, table, refresh, true);
//     }
//     return res;
//   };

//   const updateExistingEmployee = async (
//     employeeData: AdminData | DriverData,
//     endpoint: string,
//     refresh: () => Promise<void>,
//     table: string
//   ) => {
//     const updatedEmployee = await axios
//       .put(`${endpoint}/${existingEmployee!.id}`, employeeData)
//       .then((res) => {
//         refresh();
//         showToast('The employee has been edited.', ToastStatus.SUCCESS);
//         return res.data;
//       });
//     if (imageBase64 !== '') {
//       uploadPhotoForEmployee(updatedEmployee.id, table, refresh, false);
//     }
//     return updatedEmployee;
//   };

//   const createOrUpdateDriver = async (
//     driver: AdminData | DriverData,
//     isNewDriver = false
//   ) => {
//     if (isNewDriver) {
//       return await createNewEmployee(
//         driver,
//         '/api/drivers',
//         () => refreshDrivers(),
//         'Drivers'
//       );
//     } else {
//       return await updateExistingEmployee(
//         driver,
//         '/api/drivers',
//         () => refreshDrivers(),
//         'Drivers'
//       );
//     }
//   };

//   const createOrUpdateAdmin = async (admin: AdminData, isNewAdmin = false) => {
//     if (isNewAdmin) {
//       await createNewEmployee(
//         admin,
//         '/api/admins',
//         () => refreshAdmins(),
//         'Admins'
//       );
//     } else {
//       await updateExistingEmployee(
//         admin,
//         '/api/admins',
//         () => refreshAdmins(),
//         'Admins'
//       );
//     }
//   };

//   const deleteDriver = async (id: string | undefined) => {
//     await axios.delete(`/api/drivers/${id}`);
//   };

//   const deleteAdmin = async (id: string | undefined) => {
//     await axios.delete(`/api/admins/${id}`);
//   };

//   const onSubmit = async (data: ObjectType) => {
//     const { firstName, lastName, netid, phoneNumber, startDate, availability } =
//       data;

//     const driver = {
//       firstName,
//       lastName,
//       email: netid + '@cornell.edu',
//       phoneNumber,
//       startDate,
//       availability: parseAvailability(availability),
//     };
//     const admin = {
//       firstName,
//       lastName,
//       email: netid + '@cornell.edu',
//       type: selectedRole.filter((role) => !(role === 'driver')),
//       phoneNumber,
//       availability: parseAvailability(availability),
//       isDriver: selectedRole.includes('driver'),
//     };

//     const existingDriver = existingEmployee?.isDriver === undefined;
//     const existingAdmin = existingEmployee?.isDriver !== undefined;

//     if (existingEmployee) {
//       if (selectedRole.includes('driver')) {
//         if (selectedRole.some((role) => role.includes('admin'))) {
//           if (existingDriver && existingAdmin) {
//             await createOrUpdateDriver(driver, false);
//             await createOrUpdateAdmin(admin, false);
//           } else if (existingDriver) {
//             await createOrUpdateDriver(driver, false);
//             await createOrUpdateAdmin(
//               { ...admin, id: existingEmployee.id },
//               true
//             );
//           } else if (existingAdmin) {
//             await createOrUpdateDriver(
//               { ...driver, id: existingEmployee.id },
//               true
//             );
//             await createOrUpdateAdmin(admin, false);
//           }
//         } else {
//           if (existingDriver && existingAdmin) {
//             await createOrUpdateDriver(driver, false);
//             await deleteAdmin(existingEmployee.id);
//           } else if (existingDriver) {
//             await createOrUpdateDriver(driver, false);
//           } else if (existingAdmin) {
//             await createOrUpdateDriver(
//               { ...driver, id: existingEmployee.id },
//               true
//             );
//             await deleteAdmin(existingEmployee.id);
//           }
//         }
//       } else {
//         if (existingDriver && existingAdmin) {
//           await deleteDriver(existingEmployee.id);
//           await createOrUpdateAdmin(admin, false);
//         } else if (existingDriver) {
//           await deleteDriver(existingEmployee.id);
//           await createOrUpdateAdmin(
//             { ...admin, id: existingEmployee.id },
//             true
//           );
//         }
//       }
//     } else {
//       if (selectedRole.includes('driver')) {
//         if (selectedRole.some((role) => role.includes('admin'))) {
//           const id = (await createOrUpdateDriver(driver, true)).data.data.id;
//           await createOrUpdateAdmin({ ...admin, id: id }, true);
//         } else {
//           await createOrUpdateDriver(driver, true);
//         }
//       } else {
//         await createOrUpdateAdmin(admin, true);
//       }
//     }
//     closeModal();
//   };

//   function updateBase64(e: React.ChangeEvent<HTMLInputElement>) {
//     e.preventDefault();

//     if (e.target.files && e.target.files[0]) {
//       const reader = new FileReader();
//       const file = e.target.files[0];
//       reader.readAsDataURL(file);
//       reader.onload = function () {
//         let res = reader.result;
//         if (res) {
//           res = res.toString();
//           // remove "data:image/png;base64," and "data:image/jpeg;base64,"
//           const strBase64 = res.toString().substring(res.indexOf(',') + 1);
//           setImageBase64(strBase64);
//         }
//       };
//       reader.onerror = function (error) {
//         console.log('Error reading file: ', error);
//       };
//     } else {
//       console.log('Undefined file upload');
//     }
//   }

//   // const addAvailability = () => {
//   //   setAvailability([
//   //     ...availability,
//   //     { day: '', startTime: null, endTime: null },
//   //   ]);
//   // };

//   // const removeAvailability = (index: number) => {
//   //   setAvailability(availability.filter((_, i) => i !== index));
//   // };

//   return (
//     <Dialog open={isOpen} onClose={closeModal} fullWidth>
//       <DialogTitle>{modalTitle}</DialogTitle>
//       <DialogContent>
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <Upload
//               imageChange={updateBase64}
//               existingPhoto={existingEmployee?.photoLink}
//             />
//             {/* <Typography>Upload Employee Photo:</Typography>
//             <Button variant="contained" component="label">
//               Upload File
//               <input type="file" hidden onChange={handleImageUpload} />
//             </Button> */}
//           </Grid>

//           {/* First Name & Last Name */}
//           {/* <Grid item xs={6}>
//             <TextField
//               label="First Name"
//               defaultValue={existingEmployee?.firstName || ''}
//               fullWidth
//               {...methods.register('firstName')}
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField
//               label="Last Name"
//               defaultValue={existingEmployee?.lastName || ''}
//               fullWidth
//               {...methods.register('lastName')}
//             />
//           </Grid>
//           {/* <Grid item xs={6}>
//             <TextField
//               label="Net ID"
//               defaultValue={existingEmployee?.netId || ''}
//               fullWidth
//               {...methods.register('netId')}
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField
//               label="Phone Number"
//               defaultValue={existingEmployee?.phone || ''}
//               fullWidth
//               {...methods.register('phone')}
//             />
//           </Grid>  */}

//           {/* Start Date */}
//           {/* <Grid item xs={12}>
//             <Typography>Start Date:</Typography>
//             <input
//               type="date"
//               value={startDate || ''}
//               onChange={(e) => setStartDate(e.target.value)}
//             />
//           </Grid> */}
//           <EmployeeInfo
//             firstName={existingEmployee?.firstName}
//             lastName={existingEmployee?.lastName}
//             netId={existingEmployee?.netId}
//             phone={existingEmployee?.phone}
//           />
//           <StartDate existingDate={existingEmployee?.startDate} />
//           <WorkingHours
//             existingAvailability={existingEmployee?.availability}
//             hide={false}
//           />

//           {/* Availability */}
//           {/* <Grid item xs={12}>
//             <Typography>Availability:</Typography>
//             {availability.map((slot, index) => (
//               <Grid container spacing={1} key={index}>
//                 <Grid item xs={4}>
//                   <Autocomplete
//                     options={[
//                       'Monday',
//                       'Tuesday',
//                       'Wednesday',
//                       'Thursday',
//                       'Friday',
//                       'Saturday',
//                       'Sunday',
//                     ]}
//                     value={slot.day}
//                     onChange={(_, value) => {
//                       const updated = [...availability];
//                       updated[index].day = value || '';
//                       setAvailability(updated);
//                     }}
//                     renderInput={(params) => (
//                       <TextField {...params} label="Day" fullWidth />
//                     )}
//                   />
//                 </Grid>
//                 <Grid item xs={3}>
//                   <Typography>Start Time:</Typography>
//                   <input
//                     type="time"
//                     value={slot.startTime || ''}
//                     onChange={(e) => {
//                       const updated = [...availability];
//                       updated[index].startTime = e.target.value;
//                       setAvailability(updated);
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={3}>
//                   <Typography>End Time:</Typography>
//                   <input
//                     type="time"
//                     value={slot.endTime || ''}
//                     onChange={(e) => {
//                       const updated = [...availability];
//                       updated[index].endTime = e.target.value;
//                       setAvailability(updated);
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={2}>
//                   <Button
//                     variant="outlined"
//                     color="error"
//                     onClick={() => removeAvailability(index)}
//                   >
//                     Remove
//                   </Button>
//                 </Grid>
//               </Grid>
//             ))}
//             <Button onClick={addAvailability} variant="contained">
//               Add Availability
//             </Button>
//           </Grid> */}

//           <RoleSelector
//             selectedRoles={selectedRole}
//             setSelectedRoles={setSelectedRole}
//           />
//           {/* {/*Role Selector/}
//           <Grid item xs={12}>
//             <Typography>Roles:</Typography>
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={selectedRole.includes('admin')}
//                   onChange={(e) => {
//                     setSelectedRole(
//                       e.target.checked
//                         ? [...selectedRole, 'admin']
//                         : selectedRole.filter((role) => role !== 'admin')
//                     );
//                   }}
//                 />
//               }
//               label="Admin"
//             />
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={selectedRole.includes('driver')}
//                   onChange={(e) => {
//                     setSelectedRole(
//                       e.target.checked
//                         ? [...selectedRole, 'driver']
//                         : selectedRole.filter((role) => role !== 'driver')
//                     );
//                   }}
//                 />
//               }
//               label="Driver"
//             />
//           </Grid> */}
//         </Grid>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={closeModal} color="secondary">
//           Cancel
//         </Button>
//         <Button
//           type="submit"
//           onClick={methods.handleSubmit(onSubmit)}
//           color="primary"
//         >
//           {submitButtonText}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default EmployeeModal;
/////// OLDDD
// import React, { useState } from 'react';
// import { FormProvider, useForm } from 'react-hook-form';
// import Modal from '../Modal/Modal';
// import { Dialog } from '@mui/material';
// import { Button } from '../FormElements/FormElements';
// import { ObjectType } from '../../types/index';
// import EmployeeInfo from './EmployeeInfo';
// import RoleSelector from './RoleSelector';
// import StartDate from './StartDate';
// import WorkingHours from './WorkingHours';
// import Upload from './Upload';
// import styles from './employeemodal.module.css';
// import { useEmployees } from '../../context/EmployeesContext';
// import { useToast, ToastStatus } from '../../context/toastContext';
// import axios from '../../util/axios';

type EmployeeModalProps = {
  existingEmployee?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    type?: string[];
    isDriver?: boolean;
    netId?: string;
    email?: string;
    phone?: string;
    availability?: string[][];
    startDate?: string;
    photoLink?: string;
  };
  isOpen: boolean;
  setIsOpen: any;
};

type AdminData = {
  id?: string;
  firstName: any;
  lastName: any;
  type: string[];
  isDriver: boolean;
  email: any;
  phoneNumber: any;
};

type DriverData = {
  id?: string;
  firstName: any;
  lastName: any;
  email: any;
  phoneNumber: any;
  availability: ObjectType;
};

const EmployeeModal = ({
  existingEmployee,
  isOpen,
  setIsOpen,
}: EmployeeModalProps) => {
  const { showToast } = useToast();

  if (existingEmployee?.isDriver !== undefined) {
    if (existingEmployee.isDriver) {
      existingEmployee?.type?.push('driver');
    }
  } else if (existingEmployee) {
    existingEmployee.type = existingEmployee?.type || ['driver'];
  }

  const [selectedRole, setSelectedRole] = useState<string[]>(
    existingEmployee?.type || []
  );
  const [imageBase64, setImageBase64] = useState('');
  const { refreshAdmins, refreshDrivers } = useEmployees();
  const methods = useForm();

  const modalTitle = existingEmployee ? 'Edit Profile' : 'Add an Employee';
  const submitButtonText = existingEmployee ? 'Save' : 'Add';

  const closeModal = () => {
    methods.clearErrors();
    setIsOpen(false);
  };

  /**
   * Converts availabilities expressed as an array of {starTime, endTime, days}
   * objects into an object mapping the day to the start and end time of each
   * availability period
   *
   * @param availability the availibity array to convert
   * @returns the availibity array expressed as an object mapping the day to
   * the start and end time of each availibility period
   */
  const parseAvailability = (availability: ObjectType[]) => {
    const result: ObjectType = {};
    availability.forEach(({ startTime, endTime, days }) => {
      days.forEach((day: string) => {
        result[day] = { startTime, endTime };
      });
    });
    return result;
  };

  const uploadPhotoForEmployee = async (
    employeeId: string,
    table: string,
    refresh: () => Promise<void>,
    isCreate: boolean // show toast if new employee is created
  ) => {
    const photo = {
      id: employeeId,
      tableName: table,
      fileBuffer: imageBase64,
    };
    // Upload image
    await axios
      .post('/api/upload', photo)
      .then(() => {
        refresh();
      })
      .catch((err) => console.log(err));
  };

  const createNewEmployee = async (
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string
  ) => {
    const res = await axios.post(endpoint, employeeData);
    if (imageBase64 === '') {
      // If no image has been uploaded, create new employee
      refresh();
      showToast('The employee has been added.', ToastStatus.SUCCESS);
    } else {
      const { data: createdEmployee } = await res.data;
      uploadPhotoForEmployee(createdEmployee.id, table, refresh, true);
    }
    return res;
  };

  const updateExistingEmployee = async (
    employeeData: AdminData | DriverData,
    endpoint: string,
    refresh: () => Promise<void>,
    table: string
  ) => {
    const updatedEmployee = await axios
      .put(`${endpoint}/${existingEmployee!.id}`, employeeData)
      .then((res) => {
        refresh();
        showToast('The employee has been edited.', ToastStatus.SUCCESS);
        return res.data;
      });
    if (imageBase64 !== '') {
      uploadPhotoForEmployee(updatedEmployee.id, table, refresh, false);
    }
    return updatedEmployee;
  };

  const createOrUpdateDriver = async (
    driver: AdminData | DriverData,
    isNewDriver = false
  ) => {
    if (isNewDriver) {
      return await createNewEmployee(
        driver,
        '/api/drivers',
        () => refreshDrivers(),
        'Drivers'
      );
    } else {
      return await updateExistingEmployee(
        driver,
        '/api/drivers',
        () => refreshDrivers(),
        'Drivers'
      );
    }
  };

  const createOrUpdateAdmin = async (admin: AdminData, isNewAdmin = false) => {
    if (isNewAdmin) {
      await createNewEmployee(
        admin,
        '/api/admins',
        () => refreshAdmins(),
        'Admins'
      );
    } else {
      await updateExistingEmployee(
        admin,
        '/api/admins',
        () => refreshAdmins(),
        'Admins'
      );
    }
  };

  const deleteDriver = async (id: string | undefined) => {
    await axios.delete(`/api/drivers/${id}`);
  };

  const deleteAdmin = async (id: string | undefined) => {
    await axios.delete(`/api/admins/${id}`);
  };

  const onSubmit = async (data: ObjectType) => {
    const { firstName, lastName, netid, phoneNumber, startDate, availability } =
      data;

    const driver = {
      firstName,
      lastName,
      email: netid + '@cornell.edu',
      phoneNumber,
      startDate,
      availability: parseAvailability(availability),
    };

    const admin = {
      firstName,
      lastName,
      email: netid + '@cornell.edu',
      type: selectedRole.filter((role) => !(role === 'driver')),
      phoneNumber,
      availability: parseAvailability(availability),
      isDriver: selectedRole.includes('driver'),
    };

    const existingDriver = existingEmployee?.isDriver === undefined;
    const existingAdmin = existingEmployee?.isDriver !== undefined;

    if (existingEmployee) {
      if (selectedRole.includes('driver')) {
        if (selectedRole.some((role) => role.includes('admin'))) {
          if (existingDriver && existingAdmin) {
            await createOrUpdateDriver(driver, false);
            await createOrUpdateAdmin(admin, false);
          } else if (existingDriver) {
            await createOrUpdateDriver(driver, false);
            await createOrUpdateAdmin(
              { ...admin, id: existingEmployee.id },
              true
            );
          } else if (existingAdmin) {
            await createOrUpdateDriver(
              { ...driver, id: existingEmployee.id },
              true
            );
            await createOrUpdateAdmin(admin, false);
          }
        } else {
          if (existingDriver && existingAdmin) {
            await createOrUpdateDriver(driver, false);
            await deleteAdmin(existingEmployee.id);
          } else if (existingDriver) {
            await createOrUpdateDriver(driver, false);
          } else if (existingAdmin) {
            await createOrUpdateDriver(
              { ...driver, id: existingEmployee.id },
              true
            );
            await deleteAdmin(existingEmployee.id);
          }
        }
      } else {
        if (existingDriver && existingAdmin) {
          await deleteDriver(existingEmployee.id);
          await createOrUpdateAdmin(admin, false);
        } else if (existingDriver) {
          await deleteDriver(existingEmployee.id);
          await createOrUpdateAdmin(
            { ...admin, id: existingEmployee.id },
            true
          );
        }
      }
    } else {
      if (selectedRole.includes('driver')) {
        if (selectedRole.some((role) => role.includes('admin'))) {
          const id = (await createOrUpdateDriver(driver, true)).data.data.id;
          await createOrUpdateAdmin({ ...admin, id: id }, true);
        } else {
          await createOrUpdateDriver(driver, true);
        }
      } else {
        await createOrUpdateAdmin(admin, true);
      }
    }
    closeModal();
  };

  function updateBase64(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      const file = e.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = function () {
        let res = reader.result;
        if (res) {
          res = res.toString();
          // remove "data:image/png;base64," and "data:image/jpeg;base64,"
          const strBase64 = res.toString().substring(res.indexOf(',') + 1);
          setImageBase64(strBase64);
        }
      };
      reader.onerror = function (error) {
        console.log('Error reading file: ', error);
      };
    } else {
      console.log('Undefined file upload');
    }
  }
  return (
    <Dialog open={isOpen} onClose={closeModal} fullWidth>
      <DialogTitle>
        {modalTitle}
        {/* <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          
        </Typography> */}
      </DialogTitle>
      <DialogContent>
        <Upload
          imageChange={updateBase64}
          existingPhoto={existingEmployee?.photoLink}
        />
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            aria-labelledby="employee-modal"
          >
            <EmployeeInfo
              firstName={existingEmployee?.firstName}
              lastName={existingEmployee?.lastName}
              netId={existingEmployee?.netId}
              phone={existingEmployee?.phone}
            />

            <StartDate existingDate={existingEmployee?.startDate} />

            <WorkingHours
              existingAvailability={existingEmployee?.availability}
              hide={false}
            />
            <RoleSelector
              selectedRoles={selectedRole}
              setSelectedRoles={setSelectedRole}
            />
          </form>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal} color="secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={methods.handleSubmit(onSubmit)}
          color="primary"
        >
          {submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
//   return (
//     <>
//       <Modal
//         title={modalTitle}
//         isOpen={isOpen}
//         onClose={closeModal}
//         id="employee-modal"
//       >
//         <div className={styles.modalContent}>

//   <Upload
//   imageChange={updateBase64}
//   existingPhoto={existingEmployee?.photoLink}
// />;

//           <FormProvider {...methods}>
//             <form
//               onSubmit={methods.handleSubmit(onSubmit)}
//               aria-labelledby="employee-modal"
//             >
//               <EmployeeInfo
//                 firstName={existingEmployee?.firstName}
//                 lastName={existingEmployee?.lastName}
//                 netId={existingEmployee?.netId}
//                 phone={existingEmployee?.phone}
//               />

//               <StartDate existingDate={existingEmployee?.startDate} />

//               <WorkingHours
//                 existingAvailability={existingEmployee?.availability}
//                 hide={false}
//               />
//               <RoleSelector
//                 selectedRoles={selectedRole}
//                 setSelectedRoles={setSelectedRole}
//               />
//               <div className="flex items-center gap-2">
//                 <Button
//                   type="reset"
//                   className={`${styles.clearAllBtn} flex items-center`}
//                 >
//                   Clear All
//                 </Button>
//                 <Button
//                   type="submit"
//                   className={`${styles.submit} flex items-center`}
//                 >
//                   {submitButtonText}
//                 </Button>
//               </div>
//             </form>
//           </FormProvider>
//         </div>
//       </Modal>
//     </>
//   );
// };

export default EmployeeModal;
