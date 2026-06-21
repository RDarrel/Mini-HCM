import { DateTime } from "luxon";
export const toISODate = (date = new Date(), timezone = "Asia/Manila") => {
  return DateTime.fromJSDate(new Date(date)).setZone(timezone).toISODate();
};
