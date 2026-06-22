import { Clock3, Timer, Activity, CalendarClock, Moon } from "lucide-react";
import { Formatter } from "@/utilities";
import dailySummary from "./dailySummary";

const utils = {
  compute: {
    dailySummary,
  },

  statusLabel: (attendance = null) => {
    if (!attendance?.timeIn) return "Ready to Punch In";
    if (attendance.timeIn && !attendance.timeOut) return "Ready to Punch Out";

    return "Shift Completed";
  },
  shiftLabel: (schedule = null, timezone = "Asia/Manila") => {
    if (!schedule) return "No Shift Scheduled";
    return Formatter.scheduleTime(schedule, timezone);
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
      status = "in_progress",
      undertimeMinutes: UTM = 0,
    } = attendance;
    const undertimeMinutes = status === "in_progress" ? 0 : UTM;
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
