import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Timer,
} from "lucide-react";
import { useSelector } from "react-redux";

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

const STORAGE_PREFIX = "employee-attendance";

const formatClock = (date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

const formatFullDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);

const formatWeekday = (date) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);

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

const getDuration = (start, end = new Date()) => {
  if (!start) return "0h 00m";

  const diff = Math.max(0, end.getTime() - new Date(start).getTime());
  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
};

const formatDecimalHours = (minutes = 0) => `${(minutes / 60).toFixed(1)} hrs`;

const formatMinutes = (minutes = 0) => `${Math.max(0, minutes)} mins`;

const getScheduledDate = (time = "00:00", date = new Date()) => {
  const [hours = "0", minutes = "0"] = time.split(":");
  const scheduledDate = new Date(date);
  scheduledDate.setHours(Number(hours), Number(minutes), 0, 0);

  return scheduledDate;
};

const getFullName = (name) => {
  if (!name) return "Employee";
  if (typeof name === "string") return name;

  return [name.fname, name.mname, name.lname].filter(Boolean).join(" ");
};

const getStorageKey = (uid) => `${STORAGE_PREFIX}-${uid || "guest"}`;

const createTodayRecord = (records, auth) => {
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  const existing = records.find((record) => record.dateKey === dateKey);

  if (existing) return existing;

  return {
    id: dateKey,
    dateKey,
    date: formatDate(now),
    day: formatWeekday(now),
    schedule: `${formatScheduleTime(auth?.schedule?.start)} - ${formatScheduleTime(
      auth?.schedule?.end,
    )}`,
    punchIn: null,
    punchOut: null,
    punchInAt: null,
    punchOutAt: null,
    total: "0h 00m",
    status: "Pending",
  };
};

const Dashboard = () => {
  const { auth = {} } = useSelector(({ auth }) => auth);
  const [records, setRecords] = useState([]);
  const [now, setNow] = useState(new Date());

  const scheduleStart = auth?.schedule?.start || "09:00";
  const scheduleEnd = auth?.schedule?.end || "18:00";
  const storageKey = useMemo(() => getStorageKey(auth?.uid), [auth?.uid]);

  useEffect(() => {
    const storedRecords = localStorage.getItem(storageKey);
    setRecords(storedRecords ? JSON.parse(storedRecords) : []);
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(records));
  }, [records, storageKey]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);

    return () => window.clearInterval(interval);
  }, []);

  const todayRecord = useMemo(
    () => createTodayRecord(records, auth),
    [records, auth],
  );

  const isPunchedIn = Boolean(todayRecord.punchInAt && !todayRecord.punchOutAt);
  const isComplete = Boolean(todayRecord.punchInAt && todayRecord.punchOutAt);
  const todayTotal = isPunchedIn
    ? getDuration(todayRecord.punchInAt, now)
    : todayRecord.total;
  const scheduledMinutes =
    getMinutesFromTime(scheduleEnd) - getMinutesFromTime(scheduleStart);
  const workedMinutes = todayRecord.punchInAt
    ? Math.floor(
        ((todayRecord.punchOutAt ? new Date(todayRecord.punchOutAt) : now) -
          new Date(todayRecord.punchInAt)) /
          60000,
      )
    : 0;
  const lateMinutes = todayRecord.punchInAt
    ? Math.max(
        0,
        Math.floor(
          (new Date(todayRecord.punchInAt) -
            getScheduledDate(scheduleStart, new Date(todayRecord.punchInAt))) /
            60000,
        ),
      )
    : 0;
  const undertimeMinutes = isComplete
    ? Math.max(0, scheduledMinutes - workedMinutes)
    : 0;
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
  const history = useMemo(
    () =>
      [todayRecord, ...records.filter((record) => record.id !== todayRecord.id)]
        .slice(0, 6)
        .map((record) =>
          record.id === todayRecord.id
            ? { ...record, total: todayTotal }
            : record,
        ),
    [records, todayRecord, todayTotal],
  );

  const saveRecord = (nextRecord) => {
    setRecords((prev) => [
      nextRecord,
      ...prev.filter((item) => item.dateKey !== nextRecord.dateKey),
    ]);
  };

  const handlePunchIn = () => {
    const current = new Date();
    const record = createTodayRecord(records, auth);

    saveRecord({
      ...record,
      punchIn: formatClock(current),
      punchInAt: current.toISOString(),
      status: "In Progress",
    });
  };

  const handlePunchOut = () => {
    const current = new Date();
    const record = createTodayRecord(records, auth);

    saveRecord({
      ...record,
      punchOut: formatClock(current),
      punchOutAt: current.toISOString(),
      total: getDuration(record.punchInAt, current),
      status: "Completed",
    });
  };

  return (
    <main className="min-h-[calc(100vh-3.25rem)]  p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="truncate text-2xl">
                    {getFullName(auth?.name)}
                  </CardTitle>
                  <Badge variant={isPunchedIn ? "default" : "secondary"}>
                    {statusLabel}
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  {formatFullDate(now)}
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <InlineMetric
                  icon={Clock3}
                  label="Time"
                  value={formatClock(now)}
                />
              </div>
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
                <InfoPanel icon={Timer} label="Hours Logged" value={todayTotal} />
                <InfoPanel label="Attendance Status" value={statusLabel} />
              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                <Button
                  size="lg"
                  disabled={Boolean(todayRecord.punchInAt)}
                  onClick={handlePunchIn}
                >
                  <ArrowDownToLine />
                  Punch In
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={!isPunchedIn}
                  onClick={handlePunchOut}
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
                  value={todayRecord.punchIn || "-"}
                />
                <PunchCell
                  label="Punch Out"
                  value={todayRecord.punchOut || "-"}
                />
                <PunchCell label="Total Logged" value={todayTotal} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Recent records from this device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:hidden">
                {history.map((record) => (
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
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="font-medium">{record.date}</div>
                        <div className="text-xs text-muted-foreground">
                          {record.day}
                        </div>
                      </TableCell>
                      <TableCell>{record.punchIn || "-"}</TableCell>
                      <TableCell>{record.punchOut || "-"}</TableCell>
                      <TableCell className="font-medium">
                        {record.total}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {record.status === "Completed" && (
                            <CheckCircle2 className="size-3" />
                          )}
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

const InlineMetric = ({ icon, label, value }) => {
  const MetricIcon = icon;

  return (
    <div className="flex items-center gap-2">
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
        <p className="font-medium">{record.date}</p>
        <p className="text-xs text-muted-foreground">{record.day}</p>
      </div>
      <Badge variant="outline">
        {record.status === "Completed" && <CheckCircle2 className="size-3" />}
        {record.status}
      </Badge>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
      <MobileHistoryMetric label="In" value={record.punchIn || "-"} />
      <MobileHistoryMetric label="Out" value={record.punchOut || "-"} />
      <MobileHistoryMetric label="Total" value={record.total} />
    </div>
  </div>
);

const MobileHistoryMetric = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium tabular-nums">{value}</p>
  </div>
);

export default Dashboard;
