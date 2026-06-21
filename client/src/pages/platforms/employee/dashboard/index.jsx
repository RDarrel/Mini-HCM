import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BROWSE,
  GET_TODAY_RECORD,
  PUNCH,
} from "@/services/redux/slices/attendance";
import { Formatter } from "@/services/utilities";
import { Activity, CalendarClock, Clock3, History, Timer } from "lucide-react";
import utils from "./utils";
import Punch from "./punch";
import TodaySummary from "./todaySummary";
import AttHistory from "./history";
import { toast } from "sonner";
const DEFAULT_SCHEDULE = {
  start: "09:00",
  end: "18:00",
};
const DEFAULT_TIMEZONE = "Asia/Manila";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { auth = {} } = useSelector(({ auth }) => auth);
  const {
    isSubmitting,
    pagination,
    todayRecord = {},
  } = useSelector(({ attendance }) => attendance);

  const [now, setNow] = useState(new Date());

  const schedule = auth?.schedule || DEFAULT_SCHEDULE;
  const timezone = auth?.timezone || DEFAULT_TIMEZONE;
  const scheduledMinutes = utils.compute.scheduleMinutes(schedule);

  useEffect(() => {
    dispatch(BROWSE({ page: pagination.page, limit: pagination.limit }));
  }, [dispatch, pagination.page, pagination.limit]);

  useEffect(() => {
    dispatch(GET_TODAY_RECORD());
  }, [dispatch]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);

    return () => window.clearInterval(interval);
  }, []);

  const {
    regularMinutes,
    overtimeMinutes,
    nightDiffMinutes,
    lateMinutes,
    undertimeMinutes,
    totalLoggedMinutes,
  } = useMemo(
    () => utils.compute.dailySummary(todayRecord, schedule, timezone),
    [todayRecord, schedule, timezone, now],
  );

  const isPunchedIn = Boolean(todayRecord?.timeIn && !todayRecord?.timeOut);
  const workedMinutes = totalLoggedMinutes;

  const progress = Math.min(
    100,
    Math.round((workedMinutes / Math.max(scheduledMinutes, 1)) * 100),
  );

  const shiftLabel = useMemo(
    () => utils.shiftLabel(auth?.schedule, timezone),
    [auth?.schedule, timezone],
  );

  const statusLabel = useMemo(
    () => utils.statusLabel(todayRecord),
    [todayRecord],
  );

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

  return (
    <main className="min-h-[calc(100vh-3.25rem)] bg-muted/20 p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <Punch
          isPunchedIn={isPunchedIn}
          workedMinutes={workedMinutes}
          shiftLabel={shiftLabel}
          statusLabel={statusLabel}
          isSubmitting={isSubmitting}
          now={now}
          timezone={timezone}
        />

        <section className="grid gap-4">
          <TodaySummary
            progress={progress}
            summaryItems={summaryItems}
            workedMinutes={workedMinutes}
            todayRecord={todayRecord}
            timezone={timezone}
          />
          <AttHistory timezone={timezone} />
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
