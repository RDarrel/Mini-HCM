import { DateTime } from "luxon";
import toJSDate from "./toJSDate";

const time = (timestamp, timezone = "Asia/Manila") => {
  if (!timestamp) return "-";

  const jsDate = toJSDate(timestamp);

  return DateTime.fromJSDate(jsDate).setZone(timezone).toFormat("h:mm a");
};

export default time;
