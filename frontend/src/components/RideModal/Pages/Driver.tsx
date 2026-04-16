import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModalPageProps } from '../../Modal/types';
import { Label, Input, Button } from '../../FormElements/FormElements';
import axios from '../../../util/axios';

interface FormData {
  driver: string;
}

const DriverPage = ({
  onBack,
  onSubmit,
  formData,
  labelid,
}: ModalPageProps & { labelid?: string }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      driver: formData?.driver ?? '',
    },
  });
  const [loaded, setLoaded] = useState(false);

  const { date, pickupTime: startTime, dropoffTime: endTime } = formData!;
  type DriverOption = { id: string; firstName: string; lastName: string };
  const [availableDrivers, setAvailableDrivers] = useState<DriverOption[]>([]);

  useEffect(() => {
    if (startTime && endTime && date) {
      axios
        .get(
          `/api/drivers/available?date=${date}&startTime=${startTime}&endTime=${endTime}`
        )
        .then((res) => res.data)
        .then((data) => {
          setAvailableDrivers([
            { id: 'None', firstName: 'None', lastName: 'None' },
            ...data.data,
          ]);
          setLoaded(true);
        });
    }
  }, [startTime, endTime, date]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full h-full">
      <div className="mb-6 w-full">
        <div
          className="flex flex-col max-h-75 overflow-y-auto border border-[#ced4da] rounded bg-[#f8f9fa]"
          aria-required="true"
          role="radiogroup"
          aria-labelledby={labelid}
        >
          {loaded ? (
            availableDrivers.map((d) => (
              <div
                className="flex items-center p-4 border-b border-[#e9ecef] transition-colors duration-200 last:border-b-0 hover:bg-[#e9ecef]"
                key={d.id}
              >
                <Input
                  id={d.firstName + d.lastName}
                  className="appearance-none w-5 h-5 border-2 border-[#ced4da] rounded-full outline-none transition-all duration-200 checked:border-black checked:bg-black checked:shadow-[inset_0_0_0_4px_#fff] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.25),inset_0_0_0_4px_#fff]"
                  type="radio"
                  value={d.id}
                  {...register('driver', { required: true })}
                />
                <Label
                  htmlFor={d.firstName + d.lastName}
                  className="grow ml-4 text-base text-[#333] cursor-pointer"
                >
                  {d.firstName} {d.lastName}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-center text-[#6c757d] italic">Loading...</p>
          )}
        </div>
        {errors.driver?.type === 'required' && (
          <p className="text-[#dc3545] text-[0.8rem] mt-1 max-w-48">
            Please select a driver
          </p>
        )}
      </div>
      <div className="flex justify-between mt-auto max-[500px]:flex-col max-[500px]:gap-4">
        <Button outline type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default DriverPage;
