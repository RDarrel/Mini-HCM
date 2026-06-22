import { DateTime } from "luxon";
import { Formatter, toISODate } from "@/utilities";

// Convert date based on the employee timezone
export const toDateTime = (value, timezone = "Asia/Manila") => {
  const date = Formatter.toJSDate(value);
  return date ? DateTime.fromJSDate(date).setZone(timezone) : null;
};

export const timeValue = (value, timezone) =>
  toDateTime(value, timezone)?.toFormat("HH:mm") || "";

export const isoDateValue = (value, timezone) => {
  const date = Formatter.toJSDate(value);
  return date ? toISODate(date, timezone) : "";
};

// Time Out can only be the workDate or the next day to support night shifts.
export const getNextWorkDate = (workDate, timezone = "Asia/Manila") => {
  if (!workDate) return "";

  return toISODate(
    DateTime.fromISO(workDate).plus({ days: 1 }).toJSDate(),
    timezone,
  );
};

export const initialForm = {
  timeInTime: "",
  timeOutDate: "",
  timeOutTime: "",
  reason: "",
};
