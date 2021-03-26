import React from 'react';
import { TableValue } from '../../types/index';
import TableCell from './TableCell';

/**
 * Use this component to create the white panel for each table row. The table
 * should already include table headers, and the values passed in are in the
 * order in which the table headers appear.
 */
type TableRowProps = {
  values: Array<TableValue>;
};

const TableRow = (props: TableRowProps) => {
  const { values } = props;

  const resultList = values.map((val, index) => {
    const { data, tag, buttonHandler, ButtonModal } = val;
    if (index === 0) {
      /* first cell */
      return (
        <TableCell
          key={index}
          data={data}
          index={index}
          first={true}
          last={false}
        />
      );
    }
    if (buttonHandler) {
      /* if the cell is a button */
      return (
        <TableCell
          key={index}
          data={data}
          index={index}
          first={false}
          last={true}
          buttonHandler={buttonHandler}
          ButtonModal={ButtonModal}
          outline={index !== values.length - 1}
          insideButton={index === values.length - 1}
        />
      );
    }
    return (
      <TableCell
        key={index}
        data={data}
        index={index}
        first={false}
        last={false}
        tag={tag}
      />
    );
  });
  return <>{resultList}</>;
};

export default TableRow;
