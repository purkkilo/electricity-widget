import { DateTime } from "luxon";
export const formatDate = (date: DateTime) => {
  const d = date.get("day");
  const m = date.get("month");
  +1;
  const y = date.get("year");
  return `${y}/${m >= 10 ? m : `0${m}`}-${d >= 10 ? d : `0${d}`}`;
};

export const formatHourRange = (start: string, end: string) => {
  const s: DateTime = DateTime.fromISO(start);
  const e: DateTime = DateTime.fromISO(end);
  const temp_s = s.get("hour");
  const temp_e = e.get("hour");

  const s_h = temp_s >= 10 ? temp_s.toString() : `0${temp_s}`;
  const e_h = temp_e >= 10 ? temp_e.toString() : `0${temp_e}`;

  return `${s_h} - ${e_h}`;
};
