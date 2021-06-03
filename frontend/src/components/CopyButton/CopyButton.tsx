import React from 'react';
import { useRiders } from '../../context/RidersContext';

const CopyButton = () => {
  const { riders } = useRiders();
  const getRidersEmail = () => {
    let concat = '';
    riders.forEach((rider) => { concat = `${concat + rider.email}, `; });
    return concat;
  };

  const handleClick = () => {
    navigator.clipboard.writeText(getRidersEmail());
  };

  return (
    <button onClick={() => { handleClick(); }}>Copy Emails</button>
  );
};

export default CopyButton;
