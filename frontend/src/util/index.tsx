import moment from 'moment'
import React from 'react'



let format_date = (date?: string, default_format?:string, format?:string) => {
  var fmt = (format? format: "YYYY-MM-DD")
  if (date == undefined){
    try{
      return moment().format(fmt);
    }catch{
  }
  }else if (default_format == undefined){
    try{
      return moment(date).format(fmt);
    }catch{
  }
  }
  
  return moment(date, default_format).format(fmt);
}



format_date()
format_date('03/05/2021')


export default format_date
