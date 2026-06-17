const formattedDate = (date = new Date(), hasTime = false) => {
  const options = {
    month: "short", // "Jan", "Feb", etc.
    day: "2-digit", // "01", "02", etc.
    year: "numeric", // "2025"
  };

  if (hasTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hour12 = true; // 12-hour format with AM/PM
  }

  return new Date(date).toLocaleDateString("en-US", options);
};

export default formattedDate;
