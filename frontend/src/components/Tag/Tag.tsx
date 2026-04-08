import React from 'react';
import cn from 'classnames';

type TagProps = {
  reduced?: boolean;
  location: React.ReactNode;
  tag: string;
};

const Tag = ({ reduced, location, tag }: TagProps) => {
  const tagStyle = tag.toLowerCase();
  const tagColors: Record<string, string> = {
    dropoff: 'bg-red-100 text-red-700',
    pickup: 'bg-blue-100 text-blue-700',
    wheelchair: 'bg-yellow-100 text-yellow-700',
    default: 'bg-gray-100 text-gray-700',
  };

  return (
    <p>
      {reduced && <span className={cn(tagColors[tagStyle] || tagColors.default, 'px-2 py-1 rounded text-xs font-semibold')} />}
      {location}{' '}
      {!reduced && (
        <span className={cn(tagColors[tagStyle] || tagColors.default, 'px-2 py-1 rounded text-xs font-semibold')}>{tag}</span>
      )}
    </p>
  );
};

export default Tag;
