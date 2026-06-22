import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = ["2026", "2025", "2024"];

const pad = (value) => String(value).padStart(2, "0");

const getWeeks = (year, month) => {
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
};

const getCurrentWeekValue = (year, month) => {
  const currentDay = new Date().getDate();
  const weeks = getWeeks(year, month);

  const week = weeks.find((item) => {
    const { startDate, endDate } = JSON.parse(item.value);
    const start = Number(startDate.split("-")[2]);
    const end = Number(endDate.split("-")[2]);
    return currentDay >= start && currentDay <= end;
  });

  return week?.value || weeks[0]?.value || "";
};

const Weekly = ({ setWeeklyRange }) => {
  const today = new Date();

  const defaultYear = String(today.getFullYear());
  const defaultMonth = MONTHS[today.getMonth()];

  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);

  const weeks = useMemo(() => getWeeks(year, month), [year, month]);

  const [week, setWeek] = useState(() =>
    getCurrentWeekValue(defaultYear, defaultMonth),
  );

  useEffect(() => {
    if (!week) return;

    setWeeklyRange(JSON.parse(week));
  }, [setWeeklyRange, week]);

  const handleYearChange = (value) => {
    setYear(value);

    const nextWeek = getCurrentWeekValue(value, month);
    setWeek(nextWeek);
  };

  const handleMonthChange = (value) => {
    setMonth(value);

    const nextWeek = getCurrentWeekValue(year, value);
    setWeek(nextWeek);
  };

  const handleWeekChange = (value) => {
    setWeek(value);
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:flex">
      <Select value={year} onValueChange={handleYearChange}>
        <SelectTrigger className="w-full sm:w-28">
          <SelectValue placeholder="Year" />
        </SelectTrigger>

        <SelectContent>
          {years.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={month} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Month" />
        </SelectTrigger>

        <SelectContent>
          {MONTHS.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={week} onValueChange={handleWeekChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Week" />
        </SelectTrigger>

        <SelectContent>
          {weeks.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Weekly;
