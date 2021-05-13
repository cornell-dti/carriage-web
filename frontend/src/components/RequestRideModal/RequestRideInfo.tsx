import React, {useState, useEffect} from 'react';
import cn from 'classnames';
import moment from 'moment';
import { useReq } from '../../context/req';
import {useFormContext } from 'react-hook-form';
import styles from './requestridemodal.module.css';
import { Location } from '../../types';
import { Label, Input, SRLabel } from '../FormElements/FormElements';
import CustomRepeatingRides from './CustomRepeatingRides';
type RequestRideInfoProps = {
    startLocation?: string; 
    endLocation?: string; 
    startTime?: string; 
    endTime?: string; 
    recurringDays?: number[]; 
    startDate?: string; 
    endDate?: string; 
}
const RequestRideInfo = () => {
  const { register, formState, getValues } = useFormContext();
  const {errors} = formState;
  const { withDefaults } = useReq();
  const [locations, setLocations] = useState<Location[]>([]);
  useEffect(() => {
    const getExistingLocations = async () => {
      const locationsData = await fetch('/api/locations', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);
      const sortedLocations = locationsData.map((location: any) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        ...(location.tag && { tag: location.tag }),
      })).sort((a: Location, b: Location) => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });
      setLocations(sortedLocations);
    };
    getExistingLocations();
  }, [withDefaults]);
  return (
    <div className={styles.inputContainer}>
        <div className = {styles.col1}>
            <Label id="day" className={styles.largeLabel}>Day</Label>
            <Input
                id='dayInput'
                name='day'
                type='date'
                className={cn(styles.input)}
                ref={register({ required: true })}
            />
        </div>
        <div className = {styles.col2}>
            <Label htmlFor={"repeating"}>Repeating?</Label>
            <Input
            type="checkbox"
            id="repeating"
            name="repeating"
            ref={register({ required: false })}/>
        </div>
        <CustomRepeatingRides />
        <Label htmlFor="endDate">Ends</Label>    
        <Input type={'date'} name="endDate" id="endDate" 
          ref={register({ required: getValues("repeating") })}/>
        <h2 id = "pickupLabel">Pickup</h2>
        <Label id = "pickupLocation">Location</Label>
        <select name="pickupLocations" aria-labelledby="pickupLabel pickupLocations">
        {locations.map(location => {
          return (<option value={location.id}>{location.name}</option>);
        })}
        </select>
    </div>
  ); 
};

export default RequestRideInfo;