import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import moment from 'moment';
import { useReq } from '../../context/req';
import { useFormContext } from 'react-hook-form';
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
  const { register, formState, getValues, watch } = useFormContext();
  const { errors } = formState;
  const { withDefaults } = useReq();
  const [locations, setLocations] = useState<Location[]>([]);
  const [custom, setCustom] = useState(false);
  const watchRepeating = watch("recurring", false);
  const watchPickupCustom = watch("startLocation");
  const watchDropoffCustom = watch("endLocation");
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
      //Logic to prevent the other from being the default value
      sortedLocations.push({id: "Other", name: "Other", address: "custom, do not use"});
      setLocations(sortedLocations);
    };
    getExistingLocations();
  }, [withDefaults]);
  return (
    <div>
      <Label htmlFor={"startDate"} className={styles.largeLabel}>Day</Label>
      <div className={styles.box}>
        <div className={styles.errorBox}>
          <Input
            id='startDate'
            name='startDate'
            type='date'
            className={cn(styles.input)}
            ref={register({ required: true })}
          />
          {errors.startDate && <p className={styles.error}>
            Please enter a valid start date</p>}
        </div>
        <Label className={styles.boldLabel} 
        htmlFor={"recurring"}>Repeating?</Label>
        <Input
          type="checkbox"
          id="recurring"
          name="recurring"
          ref={register({ required: false })} />
      </div>
      {watchRepeating ?
        <div>
            <div className={styles.box}>
              <Label className={styles.boldLabel} id = "repeats">Repeats</Label>
              <Input
                name="whenRepeat"
                id="daily"
                ref={register({ required: watchRepeating })}
                type="radio"
                value="daily"
                onChange={() => setCustom(false)} />
              <Label className={styles.label} htmlFor="daily">Daily</Label>
              <input
                name="whenRepeat"
                id="weekly"
                ref={register({ required: watchRepeating })}
                type="radio" value="weekly"
                onChange={() => setCustom(false)} />
              <Label className={styles.label} htmlFor="weekly">Weekly</Label>
              <input
                name="whenRepeat"
                id="custom"
                ref={register({ required: watchRepeating })}
                type="radio"
                value="custom"
                onChange={() => setCustom(true)} />
              <Label className={styles.label} htmlFor="custom">Custom</Label>
            {errors.whenRepeat && <p className={styles.error}>
              Please select a value</p>}
              </div>
          {custom && watchRepeating ? <CustomRepeatingRides /> : null}
          <Label className={styles.boldLabel} htmlFor="endDate">Ends</Label>
          <Input className={styles.input} type={'date'} name="endDate" id="endDate"
            ref=
            {register({
              required: getValues("repeating"),
              validate: (endDate: any) => {
                const startDate = moment(getValues(`startDate`)).toDate();
                const valueEndDate = moment(endDate).toDate();
                return startDate.getDay() < valueEndDate.getDay() &&
                  startDate.getMonth() <= valueEndDate.getMonth() &&
                  startDate.getFullYear() <= valueEndDate.getFullYear();
              },
            })} />
          {errors.endDate && <p className={styles.error}>
            Please select a valid end date</p>}
        </div> : null}
      <Label className={styles.largeLabel} id="pickupLabel">Pickup</Label>
      <div className={styles.box}>
        <div className={styles.errorBox}>

            <Label className={styles.label} id="pickupLocation">Location</Label>
            <select className={styles.input} name="startLocation" aria-labelledby="pickupLabel pickupLocations"
              ref={register(
                { required: true })}
                >
              {locations.map(location => {
                return (<option key={location.id}
                  value={location.id}>{location.name}</option>);
              })
              }
            </select>
          {errors.startLocation && <p className={styles.error}>
            Please select a valid location</p>}
        </div>
        <div className={styles.errorBox}>
            <Label className={styles.label} id="pickupTime">Time</Label>
            <Input
              type="time"
              name="pickupTime"
              className={styles.input}
              aria-labelledby="pickupLabel pickupTime"
              ref={register({ required: true })}
            />
          {errors.pickupTime && <p className={styles.error}>
            Please choose a valid pickup time</p>}
        </div>
      </div>
      {watchPickupCustom === "Other" ? 
        <div className = {styles.box}>
          <Label className={styles.boldLabel} id="customPickup">Enter Pickup Location</Label>
          <Input className={cn(styles.input, styles.flexGrow)}
            aria-labelledby="customPickup"
            name="customPickup"
            type = "text"
            ref={register({
              required: watchPickupCustom === "Other" })}/>
          <Label className={styles.label} id="pickupCity">City</Label>
          <Input className={styles.input}
            aria-labelledby="customPickup pickupCity"
            name="pickupCity"
            type = "text"
            defaultValue="Ithaca"
            maxLength={32}
            ref={register({
              required: watchPickupCustom === "Other" })}/>
            <Label className={styles.label} id="pickupZip">Zip Code</Label>
            <Input className={styles.input}
              aria-labelledby="customPickup pickupZip"
              name="pickupZip"
              type = "text"
              defaultValue="14853"
              pattern="[0-9]*"
              maxLength={10}
              ref={register({
                required: watchDropoffCustom === "Other" })}/>

          </div>
      : null} 
      <Label className={styles.largeLabel} id="dropoffLabel">Dropoff</Label>
      <div className={styles.box}>
        <div className={styles.errorBox}>
            <Label className={styles.label} id="dropoffLocation">Location</Label>
            <select className={styles.input} name="endLocation"
              aria-labelledby="dropoffLabel dropoffLocations"
              ref={register({
                required: true,
                validate: (endLocation: string) => {
                  const startLoc = getValues("startLocation");
                  return endLocation !== startLoc || (endLocation === "Other" && startLoc === "Other");
                }
              })}>
              {locations.map(location => {
                return (<option key={location.id}
                  value={location.id}>{location.name}</option>);
              })}
            </select>
          {errors.endLocation && <p className={styles.error}>
            Please select a valid dropoff location</p>}
        </div>
        <div className={styles.errorBox}>
            <Label className={styles.label} id="dropoffTime">Time</Label>
            <Input
              type="time"
              name="dropoffTime"
              className={styles.input}
              aria-labelledby="dropoffLabel dropoffTime"
              ref={register({
                required: true,
                validate: (dropoffTime: any) => {
                  const dropoffTi = dropoffTime;
                  const pickupTi = getValues("pickupTime");
                  return dropoffTi > pickupTi;
                }
              })} />
          {errors.dropoffTime && <p className={styles.error}>
            Please choose a valid dropoff time</p>}
        </div>
        </div>
        {watchDropoffCustom === "Other" ? 
        <div className = {styles.box}>
          <Label className={styles.boldLabel} id="customDropoff">Enter Dropoff Location</Label>
          <Input className={cn(styles.input, styles.flexGrow)}
            aria-labelledby="customDropoff"
            name="customDropoff"
            type = "text"
            ref={register({
              required: watchDropoffCustom === "Other" })}/>
          <Label className={styles.label} id="dropoffCity">City</Label>
          <Input className={styles.input}
            aria-labelledby="customDropoff dropoffCity"
            name="dropoffCity"
            type = "text"
            defaultValue="Ithaca"
            maxLength={32}
            ref={register({
              required: watchDropoffCustom === "Other" })}/>
            <Label className={styles.label} id="dropoffZip">Zip Code</Label>
            <Input className={styles.input}
              aria-labelledby="customDropoff dropoffZip"
              name="dropoffZip"
              type = "text"
              defaultValue="14853"
              pattern="[0-9]*"
              maxLength={10}
              ref={register({
                required: watchDropoffCustom === "Other" })}/>

          </div>
      : null} 
    </div>
  );
};

export default RequestRideInfo;