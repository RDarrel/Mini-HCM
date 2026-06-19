import { Formatter } from "@/services/utilities";
import dailySummary from "./dailySummary";

const getMinutesFromTime = (time = "00:00") => {
  const [hours = "0", minutes = "0"] = time.split(":");

  return Number(hours) * 60 + Number(minutes);
};

const formatScheduleTime = (time = "00:00") => {
  const [hours = "0", minutes = "0"] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return Formatter.time(date);
};
const utils = {
  compute: {
    dailySummary,
    scheduleMinutes: (schedule) => {
      if (!schedule) return 0;
      return (
        getMinutesFromTime(schedule.end) - getMinutesFromTime(schedule.start)
      );
    },
  },

  statusLabel: (attendance = null) => {
    if (!attendance) return "Ready to Punch In";
    if (attendance.timeIn && !attendance.timeOut) return "Ready to Punch Out";

    return "Shift Completed";
  },
  shiftLabel: (schedule = null) => {
    if (!schedule) return "No Shift Scheduled";
    return `${formatScheduleTime(schedule.start)} - ${formatScheduleTime(schedule.end)}`;
  },
};

export default utils;
