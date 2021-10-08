import moment from 'moment';
import React from 'react';

const format_date = (
  date?: string | Date,
  default_format?: string,
  format?: string
) => {
  const fmt = format ? format : 'YYYY-MM-DD';
  if (date == undefined) {
    return moment().format(fmt);
  } else if (default_format == undefined) {
    return moment(date).format(fmt);
  }
  return moment(date, default_format).format(fmt);
};

export default format_date;
