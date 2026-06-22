import { DateTime } from "luxon";
import toJSDate from "./toJSDate";

const date = (timestamp, withTime = false, timezone = "Asia/Manila") => {
  if (!timestamp) return "-";

  const jsDate = toJSDate(timestamp);

  const dateTime = DateTime.fromJSDate(jsDate).setZone(timezone);

  return dateTime.toFormat(withTime ? "MMM dd, yyyy hh:mm a" : "MMM dd, yyyy");
};

export default date;
