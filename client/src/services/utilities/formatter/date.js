const date = (timestamp, withTime = false) => {
  if (!timestamp) return "-";

  const date =
    typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : new Date(timestamp._seconds * 1000);

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
