import { DateTime } from "luxon";
import dailySummary from "./dailySummary";
const DEFAULT_TIMEZONE = "Asia/Manila";

const getMinutesFromTime = (time = "00:00") => {
  const [hours = "0", minutes = "0"] = time.split(":");

  return Number(hours) * 60 + Number(minutes);
};

const formatScheduleTime = (time = "00:00", timezone = DEFAULT_TIMEZONE) => {
  const [hours = "0", minutes = "0"] = time.split(":");

  return DateTime.fromObject(
    {
      hour: Number(hours),
      minute: Number(minutes),
    },
    { zone: timezone },
  ).toFormat("h:mm a");
};
const utils = {
  compute: {
    dailySummary,
    scheduleMinutes: (schedule) => {
      if (!schedule) return 0;
      const minutes =
        getMinutesFromTime(schedule.end) - getMinutesFromTime(schedule.start);
      return minutes < 0 ? minutes + 24 * 60 : minutes;
    },
  },

  statusLabel: (attendance = null) => {
    if (!attendance) return "Ready to Punch In";
    if (attendance.timeIn && !attendance.timeOut) return "Ready to Punch Out";

    return "Shift Completed";
  },
  shiftLabel: (schedule = null, timezone = DEFAULT_TIMEZONE) => {
    if (!schedule) return "No Shift Scheduled";
    return `${formatScheduleTime(schedule.start, timezone)} - ${formatScheduleTime(schedule.end, timezone)}`;
  },
  canPunchIn: (attendance = null) => {
    if (!attendance) return true;
  },
  canPunchOut: (attendance = null) => {
    if (!attendance) return false;
    if (attendance?.timeIn && !attendance.timeOut) return true;
    return false;
  },
};

export default utils;
