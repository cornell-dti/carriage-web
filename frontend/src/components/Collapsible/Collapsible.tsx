import React, { useState } from 'react';
import { up, down } from '../../icons/other/index';

type CollapsibleSection = {
  title: string;
  children: JSX.Element | JSX.Element[];
};

const Collapsible = ({ title, children }: CollapsibleSection) => {
  const [expanded, setExpanded] = useState(true); // Every Collapsible component will be expanded by default
  const icon = expanded ? down : up;

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setExpanded(!expanded);
    }
  };
  return (
    <div className="w-full">
      <div className="inline-block w-full border-b border-[#ddd]">
        <div
          className="flex w-full p-[0.9375rem_2.25rem] cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <h2 className="inline-block text-[1.125rem] font-bold m-0">
            {title}
          </h2>
          <img
            className="ml-[0.75rem]"
            src={icon}
            role={'button'}
            alt={'see more'}
            tabIndex={0}
            onKeyDown={handleKeywordKeyPress}
          />
        </div>
        {expanded && <div>{children}</div>}
      </div>
    </div>
  );
};

export default Collapsible;
