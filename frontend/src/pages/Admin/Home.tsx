import { useEffect } from 'react';
import AddRideButton from '../../components/AddRideButton/AddRideButton';
import ScheduledTable from '../../components/UserTables/ScheduledTable';
import UnscheduledTable from '../../components/UserTables/UnscheduledTable';
import CancelledTable from '../../components/UserTables/CancelledTable';
import Schedule from '../../components/Schedule/Schedule';
import Collapsible from '../../components/Collapsible/Collapsible';
import { CSVFromRidesButton } from 'components/CSVFromRidesButton/CSVFromRidesButton';
import { DayNavigation } from 'components/DayNavigation/DayNavigation';

const Home = () => {
  useEffect(() => {
    document.title = 'Home - Carriage';
  }, []);

  return (
    <main id="main">
      <div className="flex flex-col gap-8 p-8">
        <div className="flex justify-between items-center p-8 text-[1.75rem] text-left m-0">
          <h1 className="w-full text-left text-[1.75rem] m-0">Ride Schedule</h1>
          <DayNavigation></DayNavigation>
          <div className="w-full flex items-center justify-end gap-2 [&>div]:ml-3.5">
            <CSVFromRidesButton></CSVFromRidesButton>
            <AddRideButton />
          </div>
        </div>

        <div className="w-full h-min px-8">
          <Schedule />
        </div>
      </div>
      <Collapsible title={'Unscheduled Rides'}>
        <UnscheduledTable />
      </Collapsible>
      <Collapsible title={'Scheduled Rides'}>
        <ScheduledTable />
      </Collapsible>
      <Collapsible title={'Cancelled Rides'}>
        <CancelledTable />
      </Collapsible>
    </main>
  );
};

export default Home;
