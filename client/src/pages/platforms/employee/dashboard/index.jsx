import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE, PUNCH } from "@/services/redux/slices/attendance";
import { Formatter } from "@/services/utilities";
import { Activity, CalendarClock, Clock3, History, Timer } from "lucide-react";
import utils from "./utils";
import Punch from "./punch";
import TodaySummary from "./todaySummary";
import AttHistory from "./history";

const DEFAULT_SCHEDULE = {
  start: "09:00",
  end: "18:00",
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { auth = {} } = useSelector(({ auth }) => auth);
  const { collections = [], isSubmitting } = useSelector(
    ({ attendance }) => attendance,
  );
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
          now={now}
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

export default Dashboard;
