import { DateTime } from "luxon";
import { Clock3, Timer, Activity, CalendarClock, Moon } from "lucide-react";
import dailySummary from "./dailySummary";
import { Formatter } from "@/services/utilities";
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

  canPunchOut: (attendance = null) => {
    if (!attendance) return false;
    if (attendance?.timeIn && !attendance.timeOut) return true;
    return false;
  },
  buildAttSummaryItems: (attendance = {}) => {
    const {
      regularMinutes = 0,
      overtimeMinutes = 0,
      nightDiffMinutes = 0,
      lateMinutes = 0,
      undertimeMinutes = 0,
    } = attendance;
    return [
      {
        label: "Regular Hours",
        value: Formatter.duration(regularMinutes),
        icon: Clock3,
      },
      {
        label: "Overtime",
        value: Formatter.duration(overtimeMinutes),
        icon: Timer,
      },
      {
        label: "Late",
        value: Formatter.duration(lateMinutes),
        icon: Activity,
      },
      {
        label: "Undertime",
        value: Formatter.duration(undertimeMinutes),
        icon: CalendarClock,
      },
      {
        label: "Night Differential",
        value: Formatter.duration(nightDiffMinutes),
        icon: Moon,
      },
    ];
  },
};

export default utils;
