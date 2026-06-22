const duration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${String(mins).padStart(2, "0")}m`;
};

export default duration;
