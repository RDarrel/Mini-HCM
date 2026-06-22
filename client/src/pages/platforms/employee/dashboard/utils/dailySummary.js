import { DateTime } from "luxon";
import { Formatter } from "@/services/utilities";
const { toJSDate } = Formatter;

const isValidDateTime = (dateTime) =>
  DateTime.isDateTime(dateTime) && dateTime.isValid;
const toDateTime = (timestamp, timezone) =>
  DateTime.fromJSDate(toJSDate(timestamp)).setZone(timezone);

const getShiftDateTime = (baseDateTime, timeString) => {
  const [hour, minute] = timeString.split(":").map(Number);

  return baseDateTime.set({
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });
};

const diffInMinutes = (start, end) => {
  if (!isValidDateTime(start) || !isValidDateTime(end)) return 0;

  return Math.max(0, Math.floor(end.diff(start, "minutes").minutes));
};

// Night differential is counted only from 10 PM to 6 AM.
const computeNightDifferential = (timeIn, timeOut) => {
  let totalMinutes = 0;
  let windowDate = timeIn.startOf("day").minus({ days: 1 });
  while (windowDate <= timeOut) {
    const ndWindowStart = windowDate.set({
      hour: 22,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    const ndWindowEnd = ndWindowStart.plus({ hours: 8 });
    const overlapStart =
      timeIn.toMillis() > ndWindowStart.toMillis() ? timeIn : ndWindowStart;
    const overlapEnd =
      timeOut.toMillis() < ndWindowEnd.toMillis() ? timeOut : ndWindowEnd;

    if (overlapEnd > overlapStart) {
      totalMinutes += diffInMinutes(overlapStart, overlapEnd);
    }

    windowDate = windowDate.plus({ days: 1 });
  }

  return totalMinutes;
};

// Computes attendance metrics using actual time in/out and assigned schedule.
const computeDailySummary = (
  attendance,
  schedule,
  timezone = "Asia/Manila",
) => {
  if (!attendance || !schedule)
    return {
      regularMinutes: 0,
      overtimeMinutes: 0,
      nightDiffMinutes: 0,
      lateMinutes: 0,
      undertimeMinutes: 0,
      totalLoggedMinutes: 0,
    };

  const timeIn = toDateTime(attendance.timeIn, timezone);
  const timeOut = attendance?.timeOut
    ? toDateTime(attendance.timeOut, timezone)
    : DateTime.now().setZone(timezone);

  const shiftStart = getShiftDateTime(timeIn, schedule.start);
  let shiftEnd = getShiftDateTime(timeIn, schedule.end);

  // Night shift: the end time belongs to the next day.
  // Example:
  // 22:00 - 06:00
  // June 20 10PM -> June 21 6AM
  if (shiftEnd <= shiftStart) {
    shiftEnd = shiftEnd.plus({ days: 1 });
  }

  const lateMinutes = diffInMinutes(shiftStart, timeIn);
  const undertimeMinutes = diffInMinutes(timeOut, shiftEnd);

  const regularStart =
    timeIn.toMillis() > shiftStart.toMillis() ? timeIn : shiftStart;
  const regularEnd =
    timeOut.toMillis() < shiftEnd.toMillis() ? timeOut : shiftEnd;

  const regularMinutes =
    regularEnd > regularStart ? diffInMinutes(regularStart, regularEnd) : 0;

  const overtimeMinutes = regularMinutes ? diffInMinutes(shiftEnd, timeOut) : 0;

  return {
    regularMinutes,
    overtimeMinutes,
    nightDiffMinutes: computeNightDifferential(timeIn, timeOut),
    lateMinutes,
    undertimeMinutes,
    totalLoggedMinutes: diffInMinutes(timeIn, timeOut),
  };
};

export default computeDailySummary;
