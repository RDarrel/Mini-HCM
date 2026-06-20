import { Formatter } from "@/services/utilities";
const { toJSDate } = Formatter;
const getShiftDateTime = (baseDate, timeString) => {
  const [hour, minute] = timeString.split(":").map(Number);

  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);

  return date;
};

const diffInMinutes = (start, end) => {
  return Math.max(0, Math.floor((end - start) / 60000));
};

// Night differential is counted only from 10 PM to 6 AM.
const computeNightDifferential = (timeIn, timeOut) => {
  const ndWindowStart = new Date(timeIn);
  ndWindowStart.setHours(22, 0, 0, 0); // 10 PM

  const ndWindowEnd = new Date(ndWindowStart);
  ndWindowEnd.setDate(ndWindowEnd.getDate() + 1);
  ndWindowEnd.setHours(6, 0, 0, 0); // 6 AM next day

  const overlapStart = new Date(
    Math.max(timeIn.getTime(), ndWindowStart.getTime()),
  );

  const overlapEnd = new Date(
    Math.min(timeOut.getTime(), ndWindowEnd.getTime()),
  );

  // No overlap
  if (overlapEnd <= overlapStart) {
    return 0;
  }

  return diffInMinutes(overlapStart, overlapEnd);
};

// Computes attendance metrics using actual time in/out and assigned schedule.
const computeDailySummary = (attendance, schedule) => {
  if (!attendance || !schedule)
    return {
      regularMinutes: 0,
      overtimeMinutes: 0,
      nightDiffMinutes: 0,
      lateMinutes: 0,
      undertimeMinutes: 0,
      totalLoggedMinutes: 0,
    };

  const timeIn = toJSDate(attendance.timeIn);
  const timeOut = toJSDate(attendance.timeOut || new Date());

  const shiftStart = getShiftDateTime(timeIn, schedule.start);
  const shiftEnd = getShiftDateTime(timeIn, schedule.end);

  // Night shift: the end time belongs to the next day.
  // Example:
  // 22:00 - 06:00
  // June 20 10PM -> June 21 6AM
  if (shiftEnd <= shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  const lateMinutes = diffInMinutes(shiftStart, timeIn);
  const undertimeMinutes = diffInMinutes(timeOut, shiftEnd);

  const regularStart = new Date(
    Math.max(timeIn.getTime(), shiftStart.getTime()),
  );

  const regularEnd = new Date(Math.min(timeOut.getTime(), shiftEnd.getTime()));

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
