const format = (date, withTime = false) => {
  const options = {
    month: "short",
    day: "2-digit",
    year: "numeric",
  };

  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return new Date(date).toLocaleDateString("en-US", options);
};

export default format;
