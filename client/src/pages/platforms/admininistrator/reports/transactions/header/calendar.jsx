import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/commerce/transactions";
const CustomCalendar = () => {
  const { token } = useSelector(({ auth }) => auth);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7); // 1 week before today

    return {
      from: oneWeekAgo,
      to: today,
    };
  });

  const dispatch = useDispatch();

  useEffect(() => {
    const { from, to } = date;
    const dateFormatted = (date) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(new Date(date))
        .replace(/\//g, "-");
    };

    dispatch(
      BROWSE({
        token,
        params: { from: dateFormatted(from), to: dateFormatted(to) },
      })
    );
  }, [date, dispatch]);

  const format = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short", // "Jan", "Feb", etc.
      day: "2-digit", // "01", "02", etc.
      year: "numeric", // "2025"
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date?.from ? (
            date?.to ? (
              <>
                {format(date.from)} - {format(date.to)}
              </>
            ) : (
              <>{format(date.from)}</>
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={(range) => {
            if (!range) return;

            // Case: pinili ulit yung parehong date (gawin from=to)
            if (range.from && !range.to) {
              setDate({ from: range.from, to: range.from });
            } else {
              setDate(range);
            }
          }}
          numberOfMonths={2}
          disabled={(day) => day > new Date()} // ⛔ disable future dates
        />
      </PopoverContent>
    </Popover>
  );
};

export default CustomCalendar;
