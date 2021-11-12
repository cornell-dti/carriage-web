import moment from 'moment';
import React from 'react';

export const format_date = (date?: string | Date, format?: string) => {
  const fmt = format ? format : 'YYYY-MM-DD';
  if (date == undefined) {
    return moment().format(fmt);
  }
  return moment(date).format(fmt);
};
