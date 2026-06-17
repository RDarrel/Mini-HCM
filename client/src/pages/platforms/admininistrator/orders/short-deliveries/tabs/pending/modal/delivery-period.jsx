import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Formatter } from "@/services/utilities";
import { CalendarIcon } from "lucide-react";
import { formatISODate } from "./utils";

const toDate = (value) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const DeliveryPeriodPicker = ({ deliveryWindow, setDeliveryWindow }) => {
  return (
    <div className="flex w-full items-center gap-3 sm:w-auto">
      <Label className="whitespace-nowrap text-xs text-muted-foreground">
        Delivery Window
      </Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-start gap-2 text-left font-normal sm:w-[360px]",
            )}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {deliveryWindow?.from ? (
              deliveryWindow?.to ? (
                <>
                  {Formatter.date(deliveryWindow.from)} –{" "}
                  {Formatter.date(deliveryWindow.to)}
                </>
              ) : (
                <>{Formatter.date(deliveryWindow.from)}</>
              )
            ) : (
              <span className="text-muted-foreground">Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            numberOfMonths={2}
            defaultMonth={toDate(deliveryWindow?.from)}
            selected={{
              from: toDate(deliveryWindow?.from),
              to: toDate(deliveryWindow?.to),
            }}
            onSelect={(range) => {
              if (!range) return;
              const from = range.from ? formatISODate(range.from) : null;
              const to = range.to ? formatISODate(range.to) : from;
              if (!from) return;
              setDeliveryWindow({ from, to });
            }}
            disabled={(day) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return day < today;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DeliveryPeriodPicker;
