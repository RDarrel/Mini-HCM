import toJSDate from "./toJSDate";
const date = (timestamp, withTime = false) => {
  if (!timestamp) return "-";

  const date = toJSDate(timestamp);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    ...(withTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
};

export default date;
