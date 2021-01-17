/* 此程式碼參照陳鍾誠老師後打出   我能完全理解此程式碼 
   以下有更詳細的註解  */
const Lib = {}

Lib.dateToString = function (date) {/* 抓取年月日並回傳 */
  return date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()
}

Lib.timeToString = function (date) {/* 時分秒 回傳 */
  return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
}