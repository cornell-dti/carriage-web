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
        const phone = fmtPhone(phoneNumber);
        const shortAddress = address.split(',')[0];
        const riderData = {
          id: r.id,
          firstName,
          lastName,
          netID: netId,
          phone,
          accessibility: disability,
        };
        const location = {
          pathname: '/riders/rider/' + r.id,
          state: riderData
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
