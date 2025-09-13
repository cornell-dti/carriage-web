import { useState, useEffect } from 'react';
import { Employee, Rider, Ride } from '../../../types/index';
import { AdminType } from '../../../../../server/src/models/admin';
import { DriverType } from '../../../../../server/src/models/driver';
import { useRiders } from '../../../context/RidersContext';
import axios from '../../../util/axios';

interface UserDetailData {
  user: Employee | Rider | null;
  rides: Ride[];
  statistics: {
    rideCount: number;
    workingHours: number;
  };
  loading: boolean;
  error: string | null;
}

const useUserDetailData = (userId: string | undefined, userType: 'employee' | 'rider'): UserDetailData => {
  const [user, setUser] = useState<Employee | Rider | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [statistics, setStatistics] = useState({ rideCount: -1, workingHours: -1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { riders } = useRiders();

  const fetchAdminData = async (employeeId: string) => {
    const res = await axios.get(`/api/admins/${employeeId}`);
    return res.data.data;
  };

  const fetchDriverData = async (employeeId: string) => {
    const res = await axios.get(`/api/drivers/${employeeId}`);
    return res.data.data;
  };

  const fetchStats = async (employeeId: string) => {
    const res = await axios.get(`/api/drivers/${employeeId}/stats`);
    return res.data.data;
  };

  const fetchEmployeeRides = async (employeeId: string) => {
    const res = await axios.get(`/api/rides?driver=${employeeId}&allDates=true`);
    return res.data.data;
  };

  const fetchRiderRides = async (riderId: string) => {
    const res = await axios.get(`/api/rides/rider/${riderId}`);
    return res.data.data;
  };

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  const setEmployeeData = async (employeeId: string) => {
    console.log('🔄 setEmployeeData called for ID:', employeeId);
    setLoading(true);
    setError(null);
    
    // Try to fetch as admin first
    try {
      const adminData: AdminType = await fetchAdminData(employeeId);
      
      if (adminData.isDriver) {
        const driverData: DriverType = await fetchDriverData(employeeId);
        setUser({
          ...driverData,
          ...adminData,
          netId: adminData.email.split('@')[0],
          startDate: driverData.joinDate,
        } as Employee);
        setEmployeeRides(employeeId);
        setEmployeeStats(employeeId);
      } else {
        setUser({
          ...adminData,
          netId: adminData.email.split('@')[0],
        } as Employee);
      }
      setLoading(false);
    } catch (adminError) {
      // If not an admin, try as driver only
      try {
        const driverData: DriverType = await fetchDriverData(employeeId);
        setUser({
          ...driverData,
          netId: driverData.email.split('@')[0],
          isDriver: true,
          startDate: driverData.joinDate,
        } as Employee);
        setEmployeeRides(employeeId);
        setEmployeeStats(employeeId);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to fetch employee data');
        setLoading(false);
      }
    }
  };

  const setEmployeeStats = async (employeeId: string) => {
    const data = await fetchStats(employeeId);
    if (!data.err) {
      setStatistics({
        rideCount: Math.floor(data.rides),
        workingHours: Math.floor(data.workingHours),
      });
    }
  };

  const setEmployeeRides = async (employeeId: string) => {
    const data = await fetchEmployeeRides(employeeId);
    setRides(data.sort(compRides));
  };

  const setRiderData = async (riderId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get rider from context
      const rider = riders.find((r) => r.id === riderId);
      if (!rider) {
        setError('Rider not found');
        setLoading(false);
        return;
      }

      // Fetch rider's rides
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
    console.log('🚀 useEffect triggered - userType:', userType, 'userId:', userId);
    if (userId) {
      if (userType === 'employee') {
        setEmployeeData(userId);
      } else {
        setRiderData(userId);
      }
    }
  }, [userId, userType]);

  return {
    user,
    rides,
    statistics,
    loading,
    error,
  };
};

export default useUserDetailData;
export type { UserDetailData };