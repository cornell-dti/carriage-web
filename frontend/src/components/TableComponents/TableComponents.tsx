import React from 'react';
import cn from 'classnames';
import Tag from '../Tag/Tag';
import useWindowSize from '../../hooks/useWindowSize';

type CellProps = {
  data: React.ReactNode;
  tag?: string;
  smallTag?: boolean;
};

/**
 * Cell component for tables. [data] are the contents of the cell. [tag] is the
 * location tag that will be displayed next to [data]. [smallTag] is true if
 * the tag should be a circle, otherwise false, and the tag text will be displayed.
 */
export const Cell = ({ data, tag, smallTag }: CellProps) => {
  if (tag) {
    return (
      <div cell}>
        <Tag location={data} tag={tag} reduced={smallTag} />
      </div>
    );
  }
  return typeof data === 'object' ? (
    <div cell}>{data}</div>
  ) : (
    <p cell}>{data}</p>
  );
};

type Row = Array<string | CellProps>;

type RowProps = {
  data: Row;
  colSizes: number[];
  header?: boolean;
  groupStart?: number;
  className?: string;
  onClick?: () => void;
};

/**
 * Row component for tables. [data] are the cell data within this row. [colSizes]
 * are the relative sizes of each column. [header] is true if this row displays
 * the table headers. [groupStart] is the cell index where the row styles should
 * begin (see rides table for example). [onClick] is a callback that is called
 * when the row is clicked.
 */
export const Row = ({
  data,
  colSizes,
  header,
  groupStart,
  className,
  onClick,
}: RowProps) => {
  const { width } = useWindowSize();
  const isMobile = Boolean(width && width < 700);

  const formatColSizes = (sizes: number[]) =>
    sizes.reduce((acc, curr) => `${acc} ${curr}fr`, '').trim();

  const formatRowSizes = (sizes: number[]) =>
    formatColSizes(sizes.map(() => 1));

  const createCells = (row: Row) =>
    row.map((cell, idx) => {
      if (typeof cell === 'string') {
        return <Cell key={idx} data={cell} />;
      }
      const { data: cData, tag } = cell;
      return <Cell key={idx} data={cData} tag={tag} smallTag={true} />;
    });

  if (!header && groupStart) {
    const nonGroup = data.slice(0, groupStart);
    const nonGroupCols = colSizes.slice(0, groupStart);
    const group = data.slice(groupStart);
    const groupCols = colSizes.slice(groupStart);
    return (
      <div
        className={cn(rowGroup, className)}
        style={
          !isMobile
            ? { gridTemplateColumns: formatColSizes(colSizes) }
            : { gridTemplateRows: formatRowSizes(colSizes) }
        }
      >
        <div
          nongroup}
          style={
            !isMobile
              ? {
                  gridTemplateColumns: formatColSizes(nonGroupCols),
                  gridColumn: `1 / ${groupStart + 1}`,
                }
              : {
                  gridTemplateRows: formatRowSizes(nonGroupCols),
                  gridRow: `1 / ${groupStart + 1}`,
                }
          }
        >
          {createCells(nonGroup)}
        </div>
        <div
          group}
          style={
            !isMobile
              ? {
                  gridTemplateColumns: formatColSizes(groupCols),
                  gridColumn: `${groupStart + 1} / -1`,
                }
              : {
                  gridTemplateRows: formatRowSizes(groupCols),
                  gridRow: `${groupStart + 1} / -1`,
                }
          }
        >
          {createCells(group)}
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        { 'bg-white': !header },
        { 'bg-gray-100 font-semibold': header },
        'grid gap-2 p-3 border-b border-gray-200',
        className
      )}
      style={
        !isMobile
          ? {
              gridTemplateColumns: formatColSizes(colSizes),
              cursor: onClick ? 'pointer' : undefined,
              width: '100%',
            }
          : {
              gridTemplateRows: formatRowSizes(colSizes),
              cursor: onClick ? 'pointer' : undefined,
            }
      }
    >
      {createCells(data)}
    </div>
  );
};

type TableProps = {
  children: React.ReactNode;
};

export const Table = ({ children }: TableProps) => (
  <div table}>{children}</div>
);
