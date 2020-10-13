import React from 'react';
import { TableValue } from '../../types/index';
import TableCell from './TableCell';


type TableRowProps = {
  values: Array<TableValue>;
};

const TableRow = (props: TableRowProps) => {
  const { values } = props;

  const resultList = values.map((val, index) => {
    const { data, tag, buttonHandler } = val;
    if (index === 0) { /* first cell */
      return (<TableCell data={data} index={index} first={true} last={false} />);
    } if (index === values.length - 1) { /* last cell */
      return (<TableCell data={data} index={index} first={false} last={true}
        buttonHandler={buttonHandler} />);
    }
    return (<TableCell data={data} index={index} first={false} last={false}
      tag={tag} />);
  });
  return (<>{resultList}</>);
};

export default TableRow;
