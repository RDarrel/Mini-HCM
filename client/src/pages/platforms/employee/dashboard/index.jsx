import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Timer,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE, PUNCH } from "@/services/redux/slices/attendance";
import { Formatter } from "@/services/utilities";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DEFAULT_SCHEDULE = {
  start: "09:00",
  end: "18:00",
};

const toDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp.toDate === "function") return timestamp.toDate();
  if (typeof timestamp._seconds === "number") {
    return new Date(timestamp._seconds * 1000);
  }

  const date = new Date(timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatClock = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const formatFullDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const formatScheduleTime = (time = "00:00") => {
  const [hours = "0", minutes = "0"] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return formatClock(date);
};

const getMinutesFromTime = (time = "00:00") => {
  const [hours = "0", minutes = "0"] = time.split(":");

  return Number(hours) * 60 + Number(minutes);
};

const getScheduledDate = (time = "00:00", date = new Date()) => {
  const [hours = "0", minutes = "0"] = time.split(":");
  const scheduledDate = new Date(date);
  scheduledDate.setHours(Number(hours), Number(minutes), 0, 0);

  return scheduledDate;
};

const getWorkedMinutes = (timeIn, timeOut, fallbackEnd = new Date()) => {
  const start = toDate(timeIn);
  const end = toDate(timeOut) || fallbackEnd;

  if (!start || !end) return 0;

  return Math.max(0, Math.floor((end - start) / 60000));
};

const formatDecimalHours = (minutes = 0) => `${(minutes / 60).toFixed(1)} hrs`;

const formatMinutes = (minutes = 0) => `${Math.max(0, minutes)} mins`;

const isSameDate = (left, right) =>
  left?.getFullYear() === right.getFullYear() &&
  left?.getMonth() === right.getMonth() &&
  left?.getDate() === right.getDate();

const Dashboard = () => {
  const dispatch = useDispatch();
  const { auth = {} } = useSelector(({ auth }) => auth);
  const {
    collections = [],
    isLoading,
    isSubmitting,
  } = useSelector(({ attendance }) => attendance);
  const [now, setNow] = useState(new Date());

  const schedule = auth?.schedule || DEFAULT_SCHEDULE;
  const scheduleStart = schedule.start || DEFAULT_SCHEDULE.start;
  const scheduleEnd = schedule.end || DEFAULT_SCHEDULE.end;
  const scheduledMinutes =
    getMinutesFromTime(scheduleEnd) - getMinutesFromTime(scheduleStart);

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);

    return () => window.clearInterval(interval);
  }, []);

  const todayRecord = useMemo(
    () =>
      collections.find((record) => isSameDate(toDate(record.timeIn), now)) ||
      null,
    [collections, now],
  );

  const isPunchedIn = Boolean(todayRecord?.timeIn && !todayRecord?.timeOut);
  const isComplete = Boolean(todayRecord?.timeIn && todayRecord?.timeOut);
  const workedMinutes = getWorkedMinutes(
    todayRecord?.timeIn,
    todayRecord?.timeOut,
    now,
  );
  const lateMinutes = todayRecord?.timeIn
    ? Math.max(
        0,
        Math.floor(
          (toDate(todayRecord.timeIn) -
            getScheduledDate(scheduleStart, toDate(todayRecord.timeIn))) /
            60000,
        ),
      )
    : 0;
  const undertimeMinutes = isComplete
    ? Math.max(0, scheduledMinutes - workedMinutes)
    : 0;
  const todayTotal = todayRecord?.timeIn
    ? formatDuration(todayRecord.timeIn, todayRecord.timeOut || now)
    : "0h 00m";
  const progress = Math.min(
    100,
    Math.round((workedMinutes / Math.max(scheduledMinutes, 1)) * 100),
  );
  const shiftLabel = `${formatScheduleTime(scheduleStart)} - ${formatScheduleTime(
    scheduleEnd,
  )}`;
  const statusLabel = isPunchedIn
    ? "On shift"
    : isComplete
      ? "Shift completed"
      : "Ready to punch in";
  const summaryItems = [
    {
      label: "Regular Hours",
      value: formatDecimalHours(Math.min(workedMinutes, scheduledMinutes)),
    },
    {
      label: "Overtime",
      value: formatDecimalHours(Math.max(0, workedMinutes - scheduledMinutes)),
    },
    {
      label: "Late",
      value: formatMinutes(lateMinutes),
    },
    {
      label: "Undertime",
      value: formatMinutes(undertimeMinutes),
    },
    {
      label: "Night Differential",
      value: "0 hrs",
    },
  ];

  const handlePunch = (punchType) => {
    dispatch(
      PUNCH({
        userId: auth.uid,
        punchType,
        schedule,
      }),
    );
  };

  return (
    <main className="min-h-[calc(100vh-3.25rem)] p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>Employee Dashboard</CardTitle>
                <CardDescription>{formatFullDate(now)}</CardDescription>
              </div>

              <InlineMetric icon={Clock3} label="Time" value={formatClock(now)} />
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
                  label="Hours Logged"
                  value={todayTotal}
                />
                <InfoPanel label="Attendance Status" value={statusLabel} />
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

        <section className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Today&apos;s Summary</CardTitle>
                  <CardDescription>
                    Payroll breakdown for the current workday.
                  </CardDescription>
                </div>
                <Badge variant="outline">{progress}% completed</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {summaryItems.map((item) => (
                  <SummaryBox
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <PunchCell
                  label="Punch In"
                  value={Formatter.time(todayRecord?.timeIn)}
                />
                <PunchCell
                  label="Punch Out"
                  value={Formatter.time(todayRecord?.timeOut)}
                />
                <PunchCell label="Total Logged" value={todayTotal} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Recent attendance records from your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading attendance records...
                </p>
              ) : collections.length ? (
                <>
                  <div className="grid gap-3 md:hidden">
                    {collections.map((record) => (
                      <HistoryCard key={record.id} record={record} />
                    ))}
                  </div>

                  <Table className="hidden md:table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Punch In</TableHead>
                        <TableHead>Punch Out</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collections.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="font-medium">
                              {Formatter.date(record.timeIn)}
                            </div>
                          </TableCell>
                          <TableCell>{Formatter.time(record.timeIn)}</TableCell>
                          <TableCell>{Formatter.time(record.timeOut)}</TableCell>
                          <TableCell className="font-medium">
                            {formatDuration(record.timeIn, record.timeOut)}
                          </TableCell>
                          <TableCell>
                            <AttendanceStatus status={record.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No attendance records yet.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

const formatDuration = (timeIn, timeOut) => {
  const start = toDate(timeIn);
  const end = toDate(timeOut);

  if (!start || !end) return "-";

  const totalMinutes = Math.max(0, Math.floor((end - start) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
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

const SummaryBox = ({ label, value }) => (
  <div className="rounded-lg border bg-muted/30 p-3">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
  </div>
);

const PunchCell = ({ label, value }) => (
  <div className="rounded-lg border bg-background p-3">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 font-semibold tabular-nums">{value}</p>
  </div>
);

const HistoryCard = ({ record }) => (
  <div className="rounded-lg border bg-background p-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-medium">{Formatter.date(record.timeIn)}</p>
        <p className="text-xs text-muted-foreground">
          {Formatter.time(record.timeIn)} - {Formatter.time(record.timeOut)}
        </p>
      </div>
      <AttendanceStatus status={record.status} />
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
      <MobileHistoryMetric label="In" value={Formatter.time(record.timeIn)} />
      <MobileHistoryMetric label="Out" value={Formatter.time(record.timeOut)} />
      <MobileHistoryMetric
        label="Total"
        value={formatDuration(record.timeIn, record.timeOut)}
      />
    </div>
  </div>
);

const AttendanceStatus = ({ status }) => (
  <Badge variant="outline">
    {status === "Completed" && <CheckCircle2 className="size-3" />}
    {status || "Pending"}
  </Badge>
);

const MobileHistoryMetric = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium tabular-nums">{value}</p>
  </div>
);

export default Dashboard;
