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
      <Label htmlFor={"startDate"} className={styles.largeLabel}>Day</Label>
        <div className = {styles.dayBox}>
            <Input
                id='startDate'
                name='startDate'
                type='date'
                className={cn(styles.input)}
                ref={register({ required: true })}
            />
            <Label htmlFor={"repeating"}>Repeating?</Label>
            <Input
            type="checkbox"
            id="repeating"
            name="repeating"
            onChange={() => setRepeatingRide(!repeatingRide)}
            ref={register({ required: false })}/>
        </div>
        {repeatingRide ? 
        <div>
          <div className ={styles.dayBox}>
          <input 
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
          <Label htmlFor="custom">Custom</Label> 
            </div>
          {custom && repeatingRide ? <CustomRepeatingRides /> : null}
          <Label htmlFor="endDate">Ends</Label>    
          <Input type={'date'} name="endDate" id="endDate" 
          ref={register({ required: getValues("repeating") })}/> 
        </div> : null}
        <Label className={styles.largeLabel} id = "pickupLabel">Pickup</Label>
        <div className ={styles.dayBox}>
        <Label id = "pickupLocation">Location</Label>
        <select className={styles.input} name="startLocation" aria-labelledby="pickupLabel pickupLocations"
          ref={register({required: true})}>
          {/* <option disabled={true} aria-disabled={true} selected={true}>Select a Location</option> */}
        {locations.map(location => {
          return (<option key={location.id} 
            value={location.id}>{location.name}</option>);
        })}
        </select>
        <Label id = "pickupTime">Time</Label>
        <Input
          type="time"
          name="startTime"
          className={styles.input}
          aria-labelledby="pickupLabel pickupTime"
          ref={register({required: true})}
          />
        </div>
        <h2 className={styles.formHeading}id = "dropoffLabel">Dropoff</h2>
        <div className ={styles.dayBox}>
        <Label id = "dropoffLocation">Location</Label>
        <select className={styles.input} name="endLocation" 
        aria-labelledby="dropoffLabel dropoffLocations" 
        ref={register({required: true})}>
        {locations.map(location => {
          return (<option key={location.id} 
            value={location.id}>{location.name}</option>);
        })}
        </select>
        <Label id = "dropoffTime">Time</Label>
        <Input
          type="time"
          name="endTime"
          className={styles.input}
          aria-labelledby="dropoffLabel dropoffTime"
          ref={register({required: true})}/>
        </div>
    </div>
  ); 
};

export default RequestRideInfo;