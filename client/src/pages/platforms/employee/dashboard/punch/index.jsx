import { InfoPanel, InlineMetric } from "../components";
import { Formatter } from "@/services/utilities";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock3,
  Timer,
  UserCheck,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
const formatFullDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
const Punch = ({
  shiftLabel = "",
  statusLabel = "",
  isSubmitting = false,
  isPunchedIn = false,
  workedMinutes = 0,
  now = new Date(),
  todayRecord = {},
  handlePunch = () => {},
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Employee Dashboard</CardTitle>
            <CardDescription>{formatFullDate(now)}</CardDescription>
          </div>

          <InlineMetric
            icon={Clock3}
            label="Time"
            value={Formatter.time(now)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoPanel
              icon={CalendarClock}
              label="Assigned Schedule"
              value={shiftLabel}
            />
            <InfoPanel
              icon={Timer}
              label="Current Session"
              value={Formatter.duration(workedMinutes)}
            />
            <InfoPanel
              icon={UserCheck}
              label="Attendance Status"
              value={statusLabel}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            <Button
              size="lg"
              disabled={isSubmitting || Boolean(todayRecord?.timeIn)}
              onClick={() => handlePunch("in")}
            >
              <ArrowDownToLine />
              Punch In
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={isSubmitting || !isPunchedIn}
              onClick={() => handlePunch("out")}
            >
              <ArrowUpFromLine />
              Punch Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Punch;
