import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import utils from "./utils";
import MONTHS from "@/constants";
const years = ["2026", "2025", "2024"];

const Weekly = ({ setWeeklyRange }) => {
  const today = new Date();

  const defaultYear = String(today.getFullYear());
  const defaultMonth = MONTHS[today.getMonth()];

  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);

  const weeks = useMemo(() => utils.getWeeks(year, month), [year, month]);

  const [week, setWeek] = useState(() =>
    utils.getCurrentWeekValue(defaultYear, defaultMonth),
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
