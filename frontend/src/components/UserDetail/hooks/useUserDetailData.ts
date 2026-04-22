import { useState, useEffect, useRef } from 'react';
import { Employee } from '../../../types/index';
import { RideType } from '@carriage-web/shared/types/ride';
import { RiderType } from '@carriage-web/shared/types/rider';
import { EmployeeType } from '@carriage-web/shared/types/employee';
import { useRiders } from '../../../context/RidersContext';
import { useEmployees } from '../../../context/EmployeesContext';
import axios from '../../../util/axios';

interface UserDetailData {
  user: Employee | RiderType | null;
  rides: RideType[];
  statistics: {
    rideCount: number;
    workingHours: number;
  };
  loading: boolean;
  error: string | null;
  refreshUserData: () => void;
}

const useUserDetailData = (
  userId: string | undefined,
  userType: 'employee' | 'rider'
): UserDetailData => {
  const [user, setUser] = useState<Employee | RiderType | null>(null);
  const [rides, setRides] = useState<RideType[]>([]);
  const [statistics, setStatistics] = useState({
    rideCount: -1,
    workingHours: -1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRiderId = useRef<string | null>(null);

  const { riders, loading: ridersLoading } = useRiders();
  const { drivers, admins, loading: employeesLoading } = useEmployees();

  const findEmployeeInContext = (employeeId: string): Employee | null => {
    // Check admins first, then drivers — both now return the same Employee shape
    const found =
      admins.find((a) => a.id === employeeId) ||
      drivers.find((d) => d.id === employeeId);
    if (!found) return null;
    return {
      ...found,
      startDate: found.joinDate,
    } as Employee;
  };

  const fetchEmployeeData = async (employeeId: string) => {
    // Try admin endpoint first, fall back to driver endpoint
    try {
      const res = await axios.get(`/api/admins/${employeeId}`);
      return res.data.data as EmployeeType;
    } catch {
      const res = await axios.get(`/api/drivers/${employeeId}`);
      return res.data.data as EmployeeType;
    }
  };

  const fetchStats = async (employeeId: string) => {
    const res = await axios.get(`/api/drivers/${employeeId}/stats`);
    return res.data.data;
  };

  const fetchEmployeeRides = async (employeeId: string) => {
    const res = await axios.get(
      `/api/rides?driver=${employeeId}&allDates=true`
    );
    return res.data.data;
  };

  const fetchRiderRides = async (riderId: string) => {
    const res = await axios.get(`/api/rides/rider/${riderId}`);
    return res.data.data;
  };

  const compRides = (a: RideType, b: RideType) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  const setEmployeeData = async (employeeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployeeData(employeeId);
      setUser({ ...data, startDate: data.joinDate } as Employee);

      if (data.isDriver) {
        const ridesData = await fetchEmployeeRides(employeeId);
        setRides(ridesData.sort(compRides));
        const statsData = await fetchStats(employeeId);
        if (!statsData?.err) {
          setStatistics({
            rideCount: Math.floor(statsData.rides),
            workingHours: Math.floor(statsData.workingHours),
          });
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Failed to fetch employee data');
      setLoading(false);
    }
  };

  const setRiderData = async (riderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const rider = riders.find((r) => r.id === riderId);
      if (!rider) {
        setError('Rider not found');
        setLoading(false);
        return;
      }

      const ridesData = await fetchRiderRides(riderId);

      setUser(rider);
      setRides(ridesData.sort(compRides));
      setStatistics({ rideCount: ridesData.length, workingHours: 0 });
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch rider data');
      console.error('Error fetching rider data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && !ridersLoading && !employeesLoading) {
      if (userType === 'employee') {
        const contextEmployee = findEmployeeInContext(userId);
        if (contextEmployee) {
          setUser(contextEmployee);
          setLoading(false);
          if (contextEmployee.isDriver) {
            fetchEmployeeRides(userId).then((data) =>
              setRides(data.sort(compRides))
            );
            fetchStats(userId).then((data) => {
              if (!data?.err) {
                setStatistics({
                  rideCount: Math.floor(data.rides),
                  workingHours: Math.floor(data.workingHours),
                });
              }
            });
          }
        } else {
          setEmployeeData(userId);
        }
      } else {
        setRiderData(userId);
        lastRiderId.current = userId;
      }
    }
  }, [userId, userType, ridersLoading, employeesLoading]);

  useEffect(() => {
    if (
      userType === 'rider' &&
      userId &&
      !ridersLoading &&
      riders.length > 0 &&
      lastRiderId.current === userId
    ) {
      const updatedRider = riders.find((r) => r.id === userId);
      if (updatedRider && user) {
        const hasChanges =
          JSON.stringify(updatedRider) !== JSON.stringify(user);
        if (hasChanges) setUser(updatedRider);
      }
    }
  }, [riders, userId, userType, ridersLoading, user]);

  useEffect(() => {
    if (
      userType === 'employee' &&
      userId &&
      !employeesLoading &&
      (admins.length > 0 || drivers.length > 0)
    ) {
      const updatedEmployee = findEmployeeInContext(userId);
      if (updatedEmployee && user) {
        const hasChanges =
          JSON.stringify(updatedEmployee) !== JSON.stringify(user);
        if (hasChanges) setUser(updatedEmployee);
      }
    }
  }, [admins, drivers, userId, userType, employeesLoading, user]);

  const refreshUserData = () => {
    if (userType === 'rider' && userId && !ridersLoading && riders.length > 0) {
      const updatedRider = riders.find((r) => r.id === userId);
      if (updatedRider) setUser(updatedRider);
    } else if (userType === 'employee' && userId && !employeesLoading) {
      const contextEmployee = findEmployeeInContext(userId);
      if (contextEmployee) {
        setUser(contextEmployee);
      } else {
        setEmployeeData(userId);
      }
    }
  };

  return {
    user,
    rides,
    statistics,
    loading,
    error,
    refreshUserData,
  };
};

export default useUserDetailData;
export type { UserDetailData };
