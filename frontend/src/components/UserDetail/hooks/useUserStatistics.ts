import { useMemo } from 'react';
import { Ride, Status, SchedulingState } from '../../../types/index';

interface StatisticsFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  statuses: Status[];
  schedulingStates: SchedulingState[];
  types: string[];
}

interface StatisticsData {
  completed: number;
  cancelled: number;
  noShows: number;
  total: number;
}

const useUserStatistics = (
  rides: Ride[],
  filters: StatisticsFilters
): StatisticsData => {
  return useMemo(() => {
    let filteredRides = rides;

    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      filteredRides = filteredRides.filter((ride) => {
        const rideDate = new Date(ride.startTime);
        if (filters.dateFrom && rideDate < filters.dateFrom) return false;
        if (filters.dateTo && rideDate > filters.dateTo) return false;
        return true;
      });
    }

    // Filter by statuses
    if (filters.statuses.length > 0) {
      filteredRides = filteredRides.filter((ride) =>
        filters.statuses.includes(ride.status)
      );
    }

    // Filter by scheduling states
    if (filters.schedulingStates.length > 0) {
      filteredRides = filteredRides.filter((ride) =>
        filters.schedulingStates.includes(
          ride.schedulingState || SchedulingState.SCHEDULED
        )
      );
    }

    // Filter by types (if applicable)
    if (filters.types.length > 0) {
      filteredRides = filteredRides.filter((ride) =>
        filters.types.includes(ride.type || 'regular')
      );
    }

    // Calculate statistics
    const completed = filteredRides.filter(
      (ride) => ride.status === Status.COMPLETED
    ).length;
    const cancelled = filteredRides.filter(
      (ride) => ride.status === Status.CANCELLED
    ).length;
    const noShows = filteredRides.filter(
      (ride) => ride.status === Status.NO_SHOW
    ).length;
    const total = filteredRides.length;

    return {
      completed,
      cancelled,
      noShows,
      total,
    };
  }, [rides, filters]);
};

export default useUserStatistics;
export type { StatisticsFilters, StatisticsData };
