import MONTHS from "@/constants";

const pad = (value) => String(value).padStart(2, "0");

const utils = {
  getCurrentWeekValue: (year, month) => {
    const currentDay = new Date().getDate();
    const weeks = getWeeks(year, month);

    const week = weeks.find((item) => {
      const { startDate, endDate } = JSON.parse(item.value);
      const start = Number(startDate.split("-")[2]);
      const end = Number(endDate.split("-")[2]);
      return currentDay >= start && currentDay <= end;
    });

    return week?.value || weeks[0]?.value || "";
  },
  getWeeks: (year, month) => {
    const monthIndex = MONTHS.indexOf(month);
    const monthNumber = monthIndex + 1;
    const lastDay = new Date(Number(year), monthNumber, 0).getDate();

    const weeks = [];

    for (let start = 1, index = 1; start <= lastDay; start += 7, index++) {
      const end = Math.min(start + 6, lastDay);

      const startDate = `${year}-${pad(monthNumber)}-${pad(start)}`;
      const endDate = `${year}-${pad(monthNumber)}-${pad(end)}`;

      weeks.push({
        label: `Week ${index} (${month.slice(0, 3)} ${start} - ${month.slice(
          0,
          3,
        )} ${end})`,
        value: JSON.stringify({
          week: index,
          startDate,
          endDate,
        }),
      });
    }

    return weeks;
  },
};

export default utils;
