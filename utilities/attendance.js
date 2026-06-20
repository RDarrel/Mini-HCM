const { DateTime } = require("luxon");

const toJSDate = (value) => {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  return new Date(value);
};

const toDateTime = (value, timezone = "Asia/Manila") => {
  const date = toJSDate(value);

  return DateTime.fromJSDate(date).setZone(timezone);
};

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
  return Math.max(0, Math.floor(end.diff(start, "minutes").minutes));
};

const maxDateTime = (a, b) => {
  return a > b ? a : b;
};

const minDateTime = (a, b) => {
  return a < b ? a : b;
};

// Night differential is counted only from 10 PM to 6 AM.
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

    const overlapStart = maxDateTime(timeIn, ndWindowStart);

    const overlapEnd = minDateTime(timeOut, ndWindowEnd);

    // No overlap
    if (overlapEnd > overlapStart) {
      totalMinutes += diffInMinutes(overlapStart, overlapEnd);
    }

    windowDate = windowDate.plus({ days: 1 });
  }

  return totalMinutes;
};

// Computes attendance metrics using actual time in/out and assigned schedule.
const computeDailySummary = ({
  timeIn,
  timeOut,
  schedule,
  timezone = "Asia/Manila",
}) => {
  const timeInDT = toDateTime(timeIn, timezone);
  const timeOutDT = toDateTime(timeOut, timezone);

  let shiftStart = getShiftDateTime(timeInDT, schedule.start);
  let shiftEnd = getShiftDateTime(timeInDT, schedule.end);

  // Night shift: the end time belongs to the next day.
  // Example:
  // 22:00 - 06:00
  // June 20 10PM -> June 21 6AM
  if (shiftEnd <= shiftStart) {
    shiftEnd = shiftEnd.plus({ days: 1 });
  }

  const lateMinutes = diffInMinutes(shiftStart, timeInDT);
  const undertimeMinutes = diffInMinutes(timeOutDT, shiftEnd);

  const regularStart = maxDateTime(timeInDT, shiftStart);

  const regularEnd = minDateTime(timeOutDT, shiftEnd);

  const regularMinutes =
    regularEnd > regularStart ? diffInMinutes(regularStart, regularEnd) : 0;

  const overtimeMinutes =
    regularMinutes > 0 ? diffInMinutes(shiftEnd, timeOutDT) : 0;

  return {
    regularMinutes,
    overtimeMinutes,
    nightDiffMinutes: computeNightDifferential(timeInDT, timeOutDT),
    lateMinutes,
    undertimeMinutes,
    totalLoggedMinutes: diffInMinutes(timeInDT, timeOutDT),
  };
};

module.exports = { computeDailySummary };
