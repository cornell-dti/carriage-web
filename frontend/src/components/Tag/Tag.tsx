import React from 'react';
import cn from 'classnames';

type TagProps = {
  reduced?: boolean;
  location: React.ReactNode;
  tag: string;
};

const getTagColor = (tag: string): string => {
  switch (tag.toLowerCase()) {
    case 'ctown':
      return 'bg-[#ffb26a]';
    case 'dtown':
      return 'bg-[#ff8b9d]';
    case 'north':
      return 'bg-[#66b5f8]';
    case 'west':
      return 'bg-[#ffe29d]';
    case 'central':
      return 'bg-[#7ddfc3]';
    case 'custom':
      return 'bg-[#f695ff]';
    case 'inactive':
      return 'bg-[#cac9c9]';
    default:
      return 'bg-gray-300';
  }
};

const Tag = ({ reduced, location, tag }: TagProps) => {
  const tagColor = getTagColor(tag);
  return (
    <p>
      {reduced && <span className={cn('h-2.75 w-2.75 inline-block ml-1.5 mr-1.25 leading-none rounded-full', tagColor)} />}
      {location}{' '}
      {!reduced && (
        <span className={cn('rounded px-1 text-sm', tagColor)}>{tag}</span>
      )}
    </p>
  );

};

export default Tag;
