import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  History,
  Timer,
  UserCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE, PUNCH } from "@/services/redux/slices/attendance";
import { Formatter } from "@/services/utilities";

import utils from "./utils";

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

const formatFullDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const getRecordMinutes = (record) => {
  if (Number.isFinite(record?.totalLoggedMinutes)) {
    return record.totalLoggedMinutes;
  }

  if (!record?.timeIn || !record?.timeOut) return 0;

  return Math.floor(
    (new Date(record.timeOut).getTime() - new Date(record.timeIn).getTime()) /
      (1000 * 60),
  );
};

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
  const scheduledMinutes = utils.compute.scheduleMinutes(schedule);

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);

    return () => window.clearInterval(interval);
  }, []);

  const todayRecord = useMemo(() => collections[0] || null, [collections]);

  const {
    regularMinutes,
    overtimeMinutes,
    nightDiffMinutes,
    lateMinutes,
    undertimeMinutes,
    totalLoggedMinutes,
  } = utils.compute.dailySummary(todayRecord, schedule);

  const isPunchedIn = Boolean(todayRecord?.timeIn && !todayRecord?.timeOut);
  const workedMinutes = totalLoggedMinutes;
  const progress = Math.min(
    100,
    Math.round((workedMinutes / Math.max(scheduledMinutes, 1)) * 100),
  );
  const shiftLabel = utils.shiftLabel(auth?.schedule);
  const statusLabel = utils.statusLabel(todayRecord);
  const summaryItems = [
    {
      label: "Regular Hours",
      value: Formatter.duration(regularMinutes),
      icon: Clock3,
    },
    {
      label: "Overtime",
      value: Formatter.duration(overtimeMinutes),
      icon: Timer,
    },
    {
      label: "Late",
      value: Formatter.duration(lateMinutes),
      icon: Activity,
    },
    {
      label: "Undertime",
      value: Formatter.duration(undertimeMinutes),
      icon: CalendarClock,
    },
    {
      label: "Night Differential",
      value: Formatter.duration(nightDiffMinutes),
      icon: History,
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
    <main className="min-h-[calc(100vh-3.25rem)] bg-muted/20 p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
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

        <section className="grid gap-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Today&apos;s Summary</CardTitle>
                  <CardDescription>
                    Payroll breakdown for the current workday.
                  </CardDescription>
                </div>
                <ClipboardList className="mt-1 size-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {summaryItems.map((item) => (
                  <SummaryBox
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
              <div className="grid gap-3 rounded-md border bg-muted/20 p-3 sm:grid-cols-3">
                <PunchCell
                  label="Punch In"
                  value={Formatter.time(todayRecord?.timeIn)}
                />
                <PunchCell
                  label="Punch Out"
                  value={Formatter.time(todayRecord?.timeOut)}
                />
                <PunchCell
                  label="Total Logged"
                  value={Formatter.duration(workedMinutes)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>
                    Recent attendance records from your account.
                  </CardDescription>
                </div>
                <History className="mt-1 size-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Loading attendance records...
                </div>
              ) : collections.length ? (
                <>
                  <div className="grid gap-3 md:hidden">
                    {collections.map((record, index) => (
                      <HistoryCard
                        key={record.id || `${record.userId}-${index}`}
                        record={record}
                      />
                    ))}
                  </div>

                  <div className="hidden overflow-hidden rounded-md border md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead>Date</TableHead>
                          <TableHead>Punch In</TableHead>
                          <TableHead>Punch Out</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {collections.map((record, index) => (
                          <TableRow
                            key={record.id || `${record.userId}-${index}`}
                            className="hover:bg-muted/30"
                          >
                            <TableCell>
                              <div className="font-medium">
                                {Formatter.date(record.timeIn)}
                              </div>
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {Formatter.time(record.timeIn)}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {Formatter.time(record.timeOut)}
                            </TableCell>
                            <TableCell className="font-medium tabular-nums">
                              {record?.timeOut
                                ? Formatter.duration(getRecordMinutes(record))
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <AttendanceStatus status={record.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  No attendance records yet.
                </div>
              )}
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

const SummaryBox = ({ icon, label, value }) => {
  const SummaryIcon = icon;

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {SummaryIcon && (
          <SummaryIcon className="size-4 text-muted-foreground" />
        )}
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
};

const PunchCell = ({ label, value }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 font-semibold tabular-nums">{value}</p>
  </div>
);

const HistoryCard = ({ record }) => (
  <div className="rounded-md border bg-background p-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium">{Formatter.date(record.timeIn)}</p>
        <p className="text-xs text-muted-foreground">
          {Formatter.time(record.timeIn)} - {Formatter.time(record.timeOut)}
        </p>
      </div>
      <AttendanceStatus status={record.status} />
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-muted/30 p-2 text-sm">
      <MobileHistoryMetric label="In" value={Formatter.time(record.timeIn)} />
      <MobileHistoryMetric label="Out" value={Formatter.time(record.timeOut)} />
      <MobileHistoryMetric
        label="Total"
        value={
          record?.timeOut ? Formatter.duration(getRecordMinutes(record)) : "-"
        }
      />
    </div>
  </div>
);

const AttendanceStatus = ({ status }) => (
  <Badge variant="outline" className="inline-flex gap-1.5 rounded-md">
    {status === "Completed" && <CheckCircle2 className="size-3" />}
    {status || "Pending"}
  </Badge>
);

const MobileHistoryMetric = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="truncate font-medium tabular-nums">{value}</p>
  </div>
);

export default Dashboard;
