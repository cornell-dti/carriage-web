import React, { useState } from 'react';

// Adapted from here: https://codepen.io/piotr-modes/pen/ErqdxE

type TabProps = {
  label: string;
  children: React.ReactNode;
};

export const Tab = ({ children }: TabProps) => <>{children}</>;

type TabSwitcherProps = {
  labels: string[];
  children: JSX.Element[];
  renderRight: () => React.ReactNode;
};

const TabSwitcher = ({ labels, children, renderRight }: TabSwitcherProps) => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <main id="main">
      <div className="flex justify-between items-center p-8 text-[1.75rem] text-left m-0">
        <div>
          <div>
            {labels.map((label, idx) => (
              <h1 key={label} className="inline">
                <button
                  className={`inline text-center text-[1.75rem] font-bold px-[0.6rem] pb-1 bg-white border-none cursor-pointer focus:border-[3px] focus:border-solid focus:border-black ${
                    currentTab === idx
                      ? 'text-black border-b-4 border-b-black border-solid'
                      : 'text-[#848484]'
                  }`}
                  onClick={() => setCurrentTab(idx)}
                >
                  {label}
                </button>
              </h1>
            ))}
          </div>
          <span className="block w-full h-px bg-[#757575]" />
        </div>
        <div className="flex items-center">{renderRight()}</div>
      </div>
      <div className="mx-8">{children[currentTab]}</div>
    </main>
  );
};

export default TabSwitcher;
