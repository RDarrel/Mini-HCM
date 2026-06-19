import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock3,
  History,
  Timer,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE, PUNCH } from "@/services/redux/slices/attendance";
import { Formatter } from "@/services/utilities";

import utils from "./utils";

import { Badge } from "@/components/ui/badge";
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
import Punch from "./punch";
import TodaySummary from "./todaySummary";
import AttHistory from "./history";

const DEFAULT_SCHEDULE = {
  start: "09:00",
  end: "18:00",
};

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
        <Punch
          handlePunch={handlePunch}
          isPunchedIn={isPunchedIn}
          workedMinutes={workedMinutes}
          shiftLabel={shiftLabel}
          statusLabel={statusLabel}
          todayRecord={todayRecord}
          isSubmitting={isSubmitting}
        />

        <section className="grid gap-4">
          <TodaySummary
            progress={progress}
            summaryItems={summaryItems}
            workedMinutes={workedMinutes}
            todayRecord={todayRecord}
          />
          <AttHistory record={todayRecord} />
        </section>
      </div>
    </main>
  );
};

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
