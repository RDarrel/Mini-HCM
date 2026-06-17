const calculateDiff = (start, end) => {
  start = new Date(start);
  end = new Date(end);

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const diffInMilliseconds = end - start;

  return Math.floor(diffInMilliseconds / millisecondsPerDay);
};

export default calculateDiff;
