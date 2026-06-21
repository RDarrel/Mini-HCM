import { DateTime } from "luxon";
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
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { PUNCH } from "@/services/redux/slices/attendance";
import { useState } from "react";
import Spinner from "@/components/shared/spinner";
import utils from "../utils";
import PunchSkeleton from "./skeleton";

const formatFullDate = (date, timezone) =>
  DateTime.fromJSDate(date).setZone(timezone).toFormat("cccc, LLLL d");
const Punch = ({
  shiftLabel = "",
  statusLabel = "",
  workedMinutes = 0,
  now = new Date(),
  timezone = "Asia/Manila",
}) => {
  const {
    todayRecord,
    isSubmitting,
    isFetchingTodayRecord: isLoading,
  } = useSelector(({ attendance }) => attendance);
  const [actionType, setActionType] = useState("");
  const dispatch = useDispatch();
  const handlePunch = (punchType) => {
    setActionType(punchType);
    dispatch(
      PUNCH({
        punchType,
      }),
    )
      .unwrap()
      .then(() => {
        setActionType("");
        toast.success(`Punched ${punchType} successfully`);
      })
      .catch((error) => {
        setActionType("");
        toast.error(error?.message || "Something went wrong");
      });
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Employee Dashboard</CardTitle>
            <CardDescription>{formatFullDate(now, timezone)}</CardDescription>
          </div>

          <InlineMetric
            icon={Clock3}
            label="Time"
            value={Formatter.time(now, timezone)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <PunchSkeleton />
        ) : (
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
              value={
                todayRecord?.status === "in_progress"
                  ? Formatter.duration(workedMinutes)
                  : "--"
              }
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
              {actionType === "in" && isSubmitting && (
                <Spinner isLoading={true} />
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={isSubmitting || !utils.canPunchOut(todayRecord)}
              onClick={() => handlePunch("out")}
            >
              <ArrowUpFromLine />
              Punch Out
              {actionType === "out" && isSubmitting && (
                <Spinner isLoading={true} />
              )}
            </Button>
          </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Punch;

const InfoPanel = ({ icon, label, value }) => {
  const PanelIcon = icon;

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {PanelIcon && <PanelIcon className="size-4 text-primary" />}
        <span>{label}</span>
      </div>
      <p className="mt-2 font-semibold tabular-nums">{value}</p>
    </div>
  );
};

const InlineMetric = ({ icon, label, value }) => {
  const MetricIcon = icon;

  return (
    <div className="flex items-center gap-2 text-sm">
      <MetricIcon className="size-4 text-primary" />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
};
