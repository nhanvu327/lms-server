/**
 * @param  {Date} date
 * @return {Number} timestamp
 */
export default function toSecondTimestamp(date: Date) {
  const datum = Date.parse(date.toUTCString());
  return datum / 1000;
}
