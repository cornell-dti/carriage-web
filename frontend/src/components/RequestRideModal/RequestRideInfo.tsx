import React, {useState, useEffect} from 'react';
import cn from 'classnames';
import moment from 'moment';
import { useReq } from '../../context/req';
import {useFormContext } from 'react-hook-form';
import styles from './requestridemodal.module.css';
import { Location } from '../../types';
import { Label, Input } from '../FormElements/FormElements';
import CustomRepeatingRides from './CustomRepeatingRides';
type RequestRideInfoProps = {
    startLocation?: Location; 
    endLocation?: Location; 
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
  const [repeatingRide, setRepeatingRide] = useState(false);
  const [custom, setCustom] = useState(false);
  useEffect(() => {
    const getExistingLocations = async () => {
      const locationsData = await fetch('/api/locations?active=true', withDefaults())
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
      <Label htmlFor={"startDate"} className={styles.largeLabel}>Day</Label>
        <div className = {styles.dayBox}>
            <Input
                id='startDate'
                name='startDate'
                type='date'
                className={cn(styles.input)}
                ref={register({ required: true })}
            />
            {errors.startDate && <p className={styles.error}>
              Please enter a valid start date</p>}
            <Label htmlFor={"recurring"}>Repeating?</Label>
            <Input
            type="checkbox"
            id="recurring"
            name="recurring"
            onChange={() => setRepeatingRide(!repeatingRide)}
            ref={register({ required: false })}/>
        </div>
        {repeatingRide ? 
        <div>
          <div className ={styles.dayBox}>
          <Input 
            name="whenRepeat" 
            id="daily"
            ref={register({ required: repeatingRide})} 
            type="radio" 
            value="daily"
            onChange={() => setCustom(false)} />
            <Label htmlFor="daily">Daily</Label> 
          <input 
            name="whenRepeat" 
            id="weekly"
            ref={register({ required: repeatingRide})} 
            type="radio" value="weekly"
            onChange={() => setCustom(false)} />
          <Label htmlFor="weekly">Weekly</Label> 
          <input 
            name="whenRepeat" 
            id="custom"
            ref={register({ required: repeatingRide})} 
            type="radio" 
            value="custom" 
            onChange={() => setCustom(true)}/>
            {errors.whenRepeat && <p className={styles.error}>
              Please select a value</p>}
          <Label htmlFor="custom">Custom</Label> 
            </div>
          {custom && repeatingRide ? <CustomRepeatingRides /> : null}
          <Label htmlFor="endDate">Ends</Label>    
          <Input type={'date'} name="endDate" id="endDate" 
          ref=
          {register({ 
            required: getValues("repeating"),
            validate: (endDate:any) => {
              const startDate = moment(getValues(`startDate`)).toDate();
              const valueEndDate = moment(endDate).toDate(); 
              return startDate.getDay() < valueEndDate.getDay() && 
                startDate.getMonth() <= valueEndDate.getMonth() && 
                startDate.getFullYear() <= valueEndDate.getFullYear();
            }, })}/> 
          {errors.endDate && <p className={styles.error}>
              Please select a valid end date</p>}
        </div> : null}
        <Label className={styles.largeLabel} id = "pickupLabel">Pickup</Label>
        <div className ={styles.dayBox}>
        <Label id = "pickupLocation">Location</Label>
        <select className={styles.input} name="startLocation" aria-labelledby="pickupLabel pickupLocations"
          ref={register(
            {required: true})}>
        {locations.map(location => {
          return (<option key={location.id} 
            value={location.id}>{location.name}</option>);
        })}
        </select>
        {errors.startLocation && <p className={styles.error}>
              Please select a valid location</p>}
        <Label id = "pickupTime">Time</Label>
        <Input
          type="time"
          name="pickupTime"
          className={styles.input}
          aria-labelledby="pickupLabel pickupTime"
          ref={register({required: true})}
          />
          {errors.pickupTime && <p className={styles.error}>
              Please select a valid pickup time</p>}
        </div>
        <h2 className={styles.formHeading}id = "dropoffLabel">Dropoff</h2>
        <div className ={styles.dayBox}>
        <Label id = "dropoffLocation">Location</Label>
        <select className={styles.input} name="endLocation" 
        aria-labelledby="dropoffLabel dropoffLocations" 
        ref={register({required: true, 
        validate: (endLocation: string)=>{
          const startLoc = getValues("startLocation");
          return endLocation !== startLoc; 
        }})}>
        {locations.map(location => {
          return (<option key={location.id} 
            value={location.id}>{location.name}</option>);
        })}
        </select>
        {errors.endLocation && <p className={styles.error}>
              Please select a valid pickup location</p>}
        <Label id = "dropoffTime">Time</Label>
        <Input
          type="time"
          name="dropoffTime"
          className={styles.input}
          aria-labelledby="dropoffLabel dropoffTime"
          ref={register({required: true, 
          validate: (dropoffTime: any) => {
            const dropoffTi = moment(dropoffTime).toDate().getTime();
            const pickupTi = moment(getValues("pickupTime")).toDate().getTime();
            return dropoffTi < pickupTi;
          }})}/>
          {errors.dropoffTime && <p className={styles.error}>
              Please select a valid pickup time</p>}
        </div>
    </div>
  ); 
};

export default RequestRideInfo;