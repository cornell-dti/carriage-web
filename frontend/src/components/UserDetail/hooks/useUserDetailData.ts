import { useState, useEffect, useRef } from 'react';
import { Employee, Rider, Ride } from '../../../types/index';
import { AdminType } from '../../../../../server/src/models/admin';
import { DriverType } from '../../../../../server/src/models/driver';
import { useRiders } from '../../../context/RidersContext';
import { useEmployees } from '../../../context/EmployeesContext';
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
  refreshUserData: () => void;
}

const useUserDetailData = (userId: string | undefined, userType: 'employee' | 'rider'): UserDetailData => {
  const [user, setUser] = useState<Employee | Rider | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [statistics, setStatistics] = useState({ rideCount: -1, workingHours: -1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRiderId = useRef<string | null>(null);
  
  const { riders, loading: ridersLoading } = useRiders();
  const { drivers, admins, loading: employeesLoading } = useEmployees();

  // Helper function to find employee from context
  const findEmployeeInContext = (employeeId: string): Employee | null => {
    // Look in admins first
    const admin = admins.find(a => a.id === employeeId);
    if (admin) {
      // If admin is also a driver, merge the data
      const driver = drivers.find(d => d.id === employeeId);
      return {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        type: admin.type,
        isDriver: admin.isDriver,
        phoneNumber: admin.phoneNumber,
        email: admin.email,
        photoLink: admin.photoLink,
        availability: driver?.availability,
        startDate: driver?.joinDate,
      } as Employee;
    }

    // Look in drivers only
    const driver = drivers.find(d => d.id === employeeId);
    if (driver) {
      return {
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        isDriver: true,
        phoneNumber: driver.phoneNumber,
        email: driver.email,
        photoLink: driver.photoLink,
        availability: driver.availability,
        startDate: driver.joinDate,
      } as Employee;
    }

    return null;
  };

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
          startDate: driverData.joinDate,
        } as Employee);
        setEmployeeRides(employeeId);
        setEmployeeStats(employeeId);
      } else {
        setUser({
          ...adminData,
        } as Employee);
      }
      setLoading(false);
    } catch (adminError) {
      // If not an admin, try as driver only
      try {
        const driverData: DriverType = await fetchDriverData(employeeId);
        setUser({
          ...driverData,
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
    console.log('🚀 useEffect triggered - userType:', userType, 'userId:', userId, 'ridersLoading:', ridersLoading, 'employeesLoading:', employeesLoading);
    if (userId && !ridersLoading && !employeesLoading) {
      if (userType === 'employee') {
        // First try to get employee from context (optimistic data)
        const contextEmployee = findEmployeeInContext(userId);
        if (contextEmployee) {
          setUser(contextEmployee);
          setLoading(false);
          // Still fetch additional data like rides and stats
          setEmployeeRides(userId);
          if (contextEmployee.isDriver) {
            setEmployeeStats(userId);
          }
        } else {
          // Fallback to API fetch
          setEmployeeData(userId);
        }
      } else {
        setRiderData(userId);
        lastRiderId.current = userId;
      }
    }
  }, [userId, userType, ridersLoading, employeesLoading]);

  // Effect to update user data when riders context changes (for rider updates)
  useEffect(() => {
    if (userType === 'rider' && userId && !ridersLoading && riders.length > 0 && lastRiderId.current === userId) {
      const updatedRider = riders.find((r) => r.id === userId);
      if (updatedRider && user) {
        // Check if any properties have changed to avoid unnecessary updates
        const currentRider = user as Rider;
        const hasChanges = JSON.stringify(updatedRider) !== JSON.stringify(currentRider);

        if (hasChanges) {
          console.log('🔄 Updating rider data from context change (optimistic or server update)');
          setUser(updatedRider);
        }
      }
    }
  }, [riders, userId, userType, ridersLoading, user]);

  // Effect to update user data when employees context changes (for employee updates)
  useEffect(() => {
    if (userType === 'employee' && userId && !employeesLoading && (admins.length > 0 || drivers.length > 0)) {
      const updatedEmployee = findEmployeeInContext(userId);
      if (updatedEmployee && user) {
        // Check if any properties have changed to avoid unnecessary updates
        const currentEmployee = user as Employee;
        const hasChanges = JSON.stringify(updatedEmployee) !== JSON.stringify(currentEmployee);

        if (hasChanges) {
          console.log('🔄 Updating employee data from context change (optimistic or server update)');
          setUser(updatedEmployee);
        }
      }
    }
  }, [admins, drivers, userId, userType, employeesLoading, user]);

  // Function to refresh user data without full reload
  const refreshUserData = () => {
    if (userType === 'rider' && userId && !ridersLoading && riders.length > 0) {
      const updatedRider = riders.find((r) => r.id === userId);
      if (updatedRider) {
        console.log('🔄 Refreshing user data without full reload');
        setUser(updatedRider);
      }
    } else if (userType === 'employee' && userId && !employeesLoading) {
      // For employees, first try to get from context (optimistic data)
      const contextEmployee = findEmployeeInContext(userId);
      if (contextEmployee) {
        console.log('🔄 Refreshing employee data without full reload');
        setUser(contextEmployee);
      } else {
        // Fallback to API fetch
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