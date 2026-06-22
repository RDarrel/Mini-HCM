import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { RECORDS } from "@/services/redux/slices/attendance";
import { toISODate } from "@/services/utilities";
import Filters from "./filters";
import TableRecords from "./table";

const Reports = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const { pagination } = useSelector(({ attendance }) => attendance);
  const dispatch = useDispatch();
  const timezone = auth?.timezone || "Asia/Manila";

  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("daily");
  const [dailyDate, setDailyDate] = useState(() => new Date());
  const [weeklyRange, setWeeklyRange] = useState(null);

  const recordParams = useMemo(() => {
    if (reportType === "weekly") {
      if (!weeklyRange) return null;

      return {
        from: toISODate(new Date(weeklyRange.startDate), timezone),
        to: toISODate(new Date(weeklyRange.endDate), timezone),
      };
    }

    return {
      from: toISODate(dailyDate, timezone),
      to: toISODate(dailyDate, timezone),
    };
  }, [dailyDate, reportType, timezone, weeklyRange]);

  useEffect(() => {
    if (!recordParams) return;

    dispatch(
      RECORDS({
        ...recordParams,
        page: 1,
        limit: pagination.limit,
      }),
    );
  }, [dispatch, pagination.limit, recordParams]);

  return (
    <main className="min-h-[calc(100vh-3.25rem)] p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Attendance Reports</CardTitle>
                <CardDescription>
                  Review attendance summaries by day or week.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs
              value={reportType}
              onValueChange={setReportType}
              className="gap-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <Filters
                    dailyDate={dailyDate}
                    reportType={reportType}
                    setDailyDate={setDailyDate}
                    setWeeklyRange={setWeeklyRange}
                    weeklyRange={weeklyRange}
                  />
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search reports"
                      className="pl-9"
                      type="search"
                    />
                  </div>
                </div>
              </div>
              <TabsContent value="daily">
                <TableRecords
                  params={recordParams}
                  reportType="Daily"
                  search={search}
                />
              </TabsContent>
              <TabsContent value="weekly">
                <TableRecords
                  params={recordParams}
                  reportType="Weekly"
                  search={search}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Reports;
