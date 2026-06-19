import toJSDate from "./toJSDate";
const time = (timestamp) => {
  if (!timestamp) return "-";

  const date = toJSDate(timestamp);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default time;
