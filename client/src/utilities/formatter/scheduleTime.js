import { DateTime } from "luxon";
const getTime = (time) => {
  const parsed = DateTime.fromFormat(time || "", "HH:mm");
  return parsed.isValid ? parsed.toFormat("h:mm a") : time || "";
};
const scheduleTime = (schedule) => {
  if (!schedule) return "--";
  const { start, end } = schedule;
  return `${getTime(start)} - ${getTime(end)}`;
};

export default scheduleTime;
