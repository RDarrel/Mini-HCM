import computeSummary from "./computeSummary";
const utils = {
  computeSummary,
  statusLabel: (attendance = null) => {
    if (!attendance) return "Ready to Punch In";
    if (attendance.timeIn && !attendance.timeOut) return "Ready to Punch Out";

    return "Shift Completed";
  },
};

export default utils;
