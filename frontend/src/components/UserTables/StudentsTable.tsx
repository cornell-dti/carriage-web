import React from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Table } from '../TableComponents/TableComponents';
import { useRiders } from '../../context/RidersContext';

const StudentsTable = () => {
  const { riders } = useRiders();
  const history = useHistory();
  const colSizes = [1, 0.75, 0.75, 1.25, 1];
  const headers = ['Name / NetId', 'Number', 'Address', 'Duration', 'Disability'];
  const fmtPhone = (number: string) => {
    const areaCode = number.slice(0, 3);
    const firstPart = number.slice(3, 6);
    const secondPart = number.slice(6);
    return `(${areaCode}) ${firstPart} ${secondPart}`;
  };
  return (
    <Table>
      <Row
        header
        colSizes={colSizes}
        data={headers.map((h) => ({ data: h }))}
      />
      {riders.map((r) => {
        const {
          id,
          firstName,
          lastName,
          email,
          address,
          phoneNumber,
          joinDate,
          accessibility,
          photoLink,
        } = r;
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
        const phone = fmtPhone(phoneNumber);
        const shortAddress = address.split(',')[0];
        const riderData = {
          id,
          firstName,
          lastName,
          netID: netId,
          phone,
          accessibility: disability,
          address,
          photoLink,
        };
        const location = {
          pathname: '/riders/rider',
          state: riderData,
          search: `?name=${`${firstName}_${lastName}`}`,
        };
        const goToDetail = () => {
          history.push(location);
        };
        const data = [nameNetId, phone, shortAddress, joinDate, disability];
        return <Row data={data} colSizes={colSizes} onClick={goToDetail} />;
      })}
    </Table>
  );
};

export default StudentsTable;
