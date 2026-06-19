const duration = (timeIn, timeOut) => {
  if (!timeIn || !timeOut) return "-";

  const start =
    typeof timeIn.toDate === "function"
      ? timeIn.toDate()
      : new Date(timeIn._seconds * 1000);

  const end =
    typeof timeOut.toDate === "function"
      ? timeOut.toDate()
      : new Date(timeOut._seconds * 1000);

  const totalMinutes = Math.floor((end - start) / (1000 * 60));

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
};

export default duration;
