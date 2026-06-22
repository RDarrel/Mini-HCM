import { useDispatch, useSelector } from "react-redux";
import { toISODate } from "@/utilities";
import { useEffect, useMemo } from "react";
import { RECORDS, TODAY_SUMMARY } from "@/redux/slices/attendance";
import buildSummaryItems from "./buildSummary";
import KPIs from "./Kpis";
import EmployeeRecords from "./records";

const Dashboard = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const { pagination, todaySummary } = useSelector(
    ({ attendance }) => attendance,
  );
  const dispatch = useDispatch();

  const date = new Date();
  // date.setDate(date.getDate() - 1);
  const from = toISODate(date, auth?.timezone);
  const to = toISODate(new Date(), auth?.timezone);

  useEffect(() => {
    dispatch(
      RECORDS({
        from,
        to,
        page: pagination.page,
        limit: pagination.limit,
      }),
    );
  }, [dispatch, auth?.timezone]);

  useEffect(() => {
    dispatch(TODAY_SUMMARY());
  }, [dispatch]);

  const { attendanceKpis, shiftKpis } = useMemo(
    () => buildSummaryItems(todaySummary),
    [todaySummary],
  );
  return (
    <main className="min-h-[calc(100vh-3.25rem)] p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <KPIs
          kpis={attendanceKpis}
          title="Today's Attendance"
          description="Daily employee attendance count"
        />
        <KPIs
          kpis={shiftKpis}
          title="Attendance Activity"
          description="Current shift and premium counts."
        />

        <EmployeeRecords from={from} to={to} />
      </div>
    </main>
  );
};

export default Dashboard;
