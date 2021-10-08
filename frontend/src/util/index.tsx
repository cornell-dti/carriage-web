import moment from 'moment';
import React from 'react';

const format_date = (
  date?: string | Date,
  default_format?: string,
  format?: string
) => {
  const fmt = format ? format : 'YYYY-MM-DD';
  if (date == undefined) {
    try {
      return moment().format(fmt);
    } catch {}
  } else if (default_format == undefined) {
    try {
      return moment(date).format(fmt);
    } catch {}
  }
  return moment(date, default_format).format(fmt);
};

export default format_date;
