import { useState, useEffect } from 'react';
import StudentsTable from '../../components/UserTables/StudentsTable';
import RiderModal from '../../components/Modal/RiderModal';
import CopyButton from '../../components/CopyButton/CopyButton';
import SearchAndFilter from 'components/FormElements/SearchAndFilter';
import { useRiders } from '../../context/RidersContext';
import { Accessibility } from '../../types';
import { RiderType } from '@carriage-web/shared/types/rider';
import StatsBox from 'components/AnalyticsOverview/StatsBox';
import { active, inactive } from '../../icons/other/index';

const Riders = () => {
  const { riders } = useRiders();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<RiderType[]>(riders);

  useEffect(() => {
    document.title = 'Students - Carriage';
    setFilteredStudents(riders);
  }, [riders]);

  const handleFilterApply = (filteredItems: RiderType[]) => {
    setFilteredStudents(filteredItems);
  };

  // Calculate statistics
  const activeStudents = riders.filter((rider) => rider.active).length;
  const inactiveStudents = riders.filter((rider) => !rider.active).length;

  const studentStats = [
    {
      icon: active,
      alt: 'active',
      stats: activeStudents,
      description: 'Active Students',
      variant: 'green' as const,
    },
    {
      icon: inactive,
      alt: 'inactive',
      stats: inactiveStudents,
      description: 'Inactive Students',
      variant: 'red' as const,
    },
  ];

  return (
    <main id="main">
      <div className="flex flex-col gap-8 p-8">
        <div className="flex justify-between items-center p-8 text-[1.75rem] text-left m-0">
          <h1 className="w-full text-left text-[1.75rem] m-0">Students</h1>
          <div className="w-full flex items-center justify-end gap-2 [&>div]:ml-3.5">
            <CopyButton />
            <button
              className="w-40 h-10 flex items-center justify-center cursor-pointer rounded text-base text-nowrap px-6 border border-[#303030] bg-black text-white transition-all duration-100 hover:bg-[#333] hover:text-white active:bg-[#555] active:text-white"
              onClick={() => setIsOpen(true)}
            >
              + Add Student
            </button>
            <RiderModal isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
        </div>

        <div className="px-8 flex flex-row items-center gap-4 w-full h-12">
          <div className="grow h-[80%] flex [&>div]:w-full [&>div]:h-[80%]">
            <SearchAndFilter
              items={riders}
              searchFields={['firstName', 'lastName']}
              filterOptions={[
                {
                  field: 'active',
                  label: 'Status',
                  options: [
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ],
                },
                {
                  field: 'accessibility',
                  label: 'Disability',
                  options: Object.values(Accessibility).map((value) => ({
                    value,
                    label: value,
                  })),
                },
              ]}
              onFilterApply={handleFilterApply}
            />
          </div>
          <div className="flex gap-4 shrink-0 h-full">
            {studentStats.map((stat, idx) => (
              <StatsBox key={idx} {...stat} />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <StudentsTable students={filteredStudents} />
        </div>
      </div>
    </main>
  );
};

export default Riders;
