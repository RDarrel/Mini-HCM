import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HISTORY, TODAY_RECORD, RESET } from "@/redux/slices/attendance";
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
  const { pagination, todayRecord = {} } = useSelector(
    ({ attendance }) => attendance,
  );

  const [now, setNow] = useState(new Date());

  const schedule = auth?.schedule || DEFAULT_SCHEDULE;
  const timezone = auth?.timezone || DEFAULT_TIMEZONE;

  useEffect(() => {
    //Render on mount
    dispatch(HISTORY({ page: pagination.page, limit: pagination.limit }));
    //Unmount
    return () => dispatch(RESET());
  }, [dispatch]);

  useEffect(() => {
    dispatch(TODAY_RECORD());
  }, [dispatch]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);

    return () => window.clearInterval(interval);
  }, []);

  const { totalLoggedMinutes, ...summary } = useMemo(
    () => utils.computeDailySummary(todayRecord, schedule, timezone),
    [todayRecord, schedule, timezone, now],
  );

  const workedMinutes = totalLoggedMinutes;

  const shiftLabel = useMemo(
    () => utils.shiftLabel(auth?.schedule, timezone),
    [auth?.schedule, timezone],
  );

  const statusLabel = useMemo(
    () => utils.statusLabel(todayRecord),
    [todayRecord],
  );

  const summaryItems = useMemo(
    () =>
      utils.buildAttSummaryItems({ ...summary, status: todayRecord?.status }),
    [summary, todayRecord?.status],
  );

  return (
    <main className="min-h-[calc(100vh-3.25rem)]  p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <Punch
          workedMinutes={workedMinutes}
          shiftLabel={shiftLabel}
          statusLabel={statusLabel}
          now={now}
          timezone={timezone}
        />

        <section className="grid gap-4">
          <TodaySummary
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
