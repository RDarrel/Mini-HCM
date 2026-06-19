const toJSDate = (value) => {
  if (!value) return null;
  if (value.toDate) return value.toDate();
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

  // No overlap found
  if (overlapEnd <= overlapStart) {
    return 0;
  }

  const ndMinutes = diffInMinutes(overlapStart, overlapEnd);

  return Number((ndMinutes / 60).toFixed(2));
};

const computeDailySummary = ({ timeIn, timeOut, schedule }) => {
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

  return {
    regularHours: Number((regularMinutes / 60).toFixed(2)),
    overtimeHours: Number((overtimeMinutes / 60).toFixed(2)),
    nightDifferentialHours: computeNightDifferential(timeIn, timeOut),
    lateMinutes,
    undertimeMinutes,
  };
};

module.exports = { computeDailySummary };
