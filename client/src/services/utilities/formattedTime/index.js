const formattedTime = (time) => {
  const strToArray = time.split(":");
  var firstColumnHour = Number(strToArray[0]);
  var secondColumnHour = Number(strToArray[1]);
  var period = "AM";
  if (firstColumnHour >= 13) {
    firstColumnHour -= 12;
    period = "PM";
  }
  return `${firstColumnHour}:${secondColumnHour} ${period}`;
};

export default formattedTime;
