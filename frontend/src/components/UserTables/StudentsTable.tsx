import React from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Table } from '../TableComponents/TableComponents';
import { useRiders } from '../../context/RidersContext';

export default () => {
  const { riders } = useRiders();
  const history = useHistory();
  const colSizes = [0.75, 1, 1.5, 0.5, 1];
  const headers = ['Name / NetId', 'Number', 'Address', 'Duration', 'Disability'];
  return (
    <Table>
      <Row
        header
        colSizes={colSizes}
        data={headers.map((h) => ({ data: h }))}
      />
      {riders.map((r) => {
        const { firstName, lastName, email, address, phoneNumber, joinDate, accessibility } = r;
        const netId = email.split('@')[0];
        const nameNetId = {
          data:
            <span>
              <span style={{ fontWeight: 'bold' }}>
                {`${firstName} ${lastName}`}
              </span>
              {` ${netId}`}
            </span>,
        };
        const disability = accessibility.join(', ');
        const riderData = {
          firstName,
          lastName,
          netID: netId,
          phone: phoneNumber,
          accessibility: disability,
        };
        const location = {
          pathname: '/riders/rider',
          state: riderData,
          search: `?name=${`${firstName}_${lastName}`}`,
        };
        const goToDetail = () => {
          history.push(location);
        };
        const data = [nameNetId, phoneNumber, address, joinDate, disability];
        return <Row data={data} colSizes={colSizes} onClick={goToDetail} />;
      })}
    </Table>
  );
};
