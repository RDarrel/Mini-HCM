const toJSDate = (value) => {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (typeof value._seconds === "number")
    return new Date(value._seconds * 1000);
  return new Date(value);
};

export default toJSDate;
