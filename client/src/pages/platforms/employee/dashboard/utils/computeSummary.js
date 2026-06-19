const toJSDate = (value) => {
  if (!value) return new Date();
  if (value.toDate) return value.toDate();
  if (typeof value._seconds === "number")
    return new Date(value._seconds * 1000);
  return new Date(value);
};

const getShiftDateTime = (baseDate, timeString) => {
  const [hour, minute] = timeString.split(":").map(Number);

  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);

  return date;
};

const diffInMinutes = (start, end) => {
  return Math.max(0, Math.floor((end - start) / 60000));
};

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
  const timeOut = toJSDate(attendance.timeOut);

  const shiftStart = getShiftDateTime(timeIn, schedule.start);
  const shiftEnd = getShiftDateTime(timeIn, schedule.end);

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

  const overtimeMinutes = diffInMinutes(shiftEnd, timeOut);
  const totalLoggedMinutes = Math.floor(
    (timeOut.getTime() - timeIn.getTime()) / (1000 * 60),
  );

  return {
    regularMinutes,
    overtimeMinutes,
    nightDiffMinutes: computeNightDifferential(timeIn, timeOut),
    lateMinutes,
    undertimeMinutes,
    totalLoggedMinutes,
  };
};

export default computeDailySummary;
