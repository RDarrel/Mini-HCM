import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE, GET_TODAY_RECORD } from "@/services/redux/slices/attendance";
import utils from "./utils";
import Punch from "./punch";
import TodaySummary from "./todaySummary";
import AttHistory from "./history";
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

  const { totalLoggedMinutes, ...summary } = useMemo(
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

  const summaryItems = useMemo(
    () => utils.buildAttSummaryItems(summary),
    [summary],
  );

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
