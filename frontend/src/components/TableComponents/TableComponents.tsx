import React from 'react';
import cn from 'classnames';
import styles from './tablecomponents.module.css';

type CellProps = {
  data: React.ReactNode;
  tag?: string;
  smallTag?: boolean;
}

export const Cell = ({ data, tag, smallTag }: CellProps) => (
  <div className={styles.cell}>
    {data}
  </div>
);

type Row = Array<string | CellProps>;

type RowProps = {
  data: Row;
  colSizes: number[];
  header?: boolean;
  groupStart?: number;
  onClick?: () => void;
}

export const Row = ({ data, colSizes, header, groupStart, onClick }: RowProps) => {
  const formatColSizes = (sizes: number[]) => (
    sizes.reduce((acc, curr) => `${acc} ${curr}fr`, '').trim()
  );

  const createCells = (row: Row) => row.map((cell) => {
    if (typeof cell === 'string') {
      return <Cell data={cell} />;
    }
    const { data: cData, tag, smallTag } = cell;
    return <Cell data={cData} tag={tag} smallTag={smallTag} />;
  });

  if (!header && groupStart) {
    const nonGroup = data.slice(0, groupStart);
    const nonGroupCols = colSizes.slice(0, groupStart);
    const group = data.slice(groupStart);
    const groupCols = colSizes.slice(groupStart);
    return (
      <div
        className={styles.rowGroup}
        style={{
          gridTemplateColumns: formatColSizes(colSizes),
          cursor: onClick ? 'pointer' : undefined,
        }}
        onClick={onClick}
      >
        <div
          className={styles.nongroup}
          style={{
            gridTemplateColumns: formatColSizes(nonGroupCols),
            gridColumn: `1 / ${groupStart + 1}`,
          }}
        >
          {createCells(nonGroup)}
        </div>
        <div
          className={styles.group}
          style={{
            gridTemplateColumns: formatColSizes(groupCols),
            gridColumn: `${groupStart + 1} / -1`,
          }}
        >
          {createCells(group)}
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn({ [styles.row]: !header }, { [styles.header]: header })}
      style={{
        gridTemplateColumns: formatColSizes(colSizes),
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
    >
      {createCells(data)}
    </div>
  );
};

type TableProps = {
  children: React.ReactNode;
}

export const Table = ({ children }: TableProps) => (
  <div className={styles.table}>
    {children}
  </div>
);
