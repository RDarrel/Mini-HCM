import { createElement } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { Formatter } from "@/services/utilities";
import { cn } from "@/lib/utils";

const TimeInput = ({ id, max, min, value, onChange }) => (
  <div className="grid gap-1.5">
    <Label htmlFor={id}>Time</Label>
    <Input
      id={id}
      type="time"
      max={max}
      min={min}
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

const LockedDate = ({ value }) => (
  <div className="grid gap-1.5">
    <Label>Date</Label>
    <div className="flex h-9 items-center gap-2 rounded-md border bg-muted/40 px-2.5 text-sm">
      <CalendarDays className="size-4 text-muted-foreground" />
      <span>{value}</span>
    </div>
  </div>
);

const TimeCard = ({ children, icon: Icon, title }) => (
  <section className="rounded-md border p-3">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {Icon && <Icon className="size-4 text-muted-foreground" />}
    </div>
    <div className="grid gap-2.5">{children}</div>
  </section>
);

const InfoPill = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-sm">
    {createElement(icon, { className: "size-4 text-muted-foreground" })}
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="font-medium leading-tight">{value}</div>
    </div>
  </div>
);

const IconBox = ({ icon }) => (
  <div className="rounded-md border bg-background p-1.5">
    {createElement(icon, { className: "size-4 text-muted-foreground" })}
  </div>
);

const TimeOutDateButton = ({
  date,
  isSelected,
  onClick,
  timezone,
  workDate,
}) => (
  <Button
    type="button"
    variant={isSelected ? "default" : "outline"}
    className={cn(
      "h-auto min-h-9 justify-start px-2.5 py-1.5 text-left",
      isSelected && "shadow-sm",
    )}
    onClick={() => onClick(date)}
  >
    <span className="min-w-0">
      <span className="block text-[11px] leading-tight">
        {date === workDate ? "Work date" : "Next day"}
      </span>
      <span className="block truncate text-xs font-medium leading-tight">
        {Formatter.date(date, false, timezone)}
      </span>
    </span>
  </Button>
);

export {
  LockedDate,
  TimeInput,
  TimeCard,
  InfoPill,
  IconBox,
  TimeOutDateButton,
};
