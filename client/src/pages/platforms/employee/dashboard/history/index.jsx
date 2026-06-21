import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChevronDown, History } from "lucide-react";
import { useSelector } from "react-redux";
import { Formatter } from "@/services/utilities";
import { useDispatch } from "react-redux";
import { BROWSE } from "@/services/redux/slices/attendance";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DailySummaryTile } from "./components";
import { AttendanceStatus } from "./components";
import Pagination from "@/components/shared/pagination";
import HistoryTable from "./table";
import utils from "../utils";

const AttHistory = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const {
    collections = [],
    isLoading,
    pagination,
  } = useSelector(({ attendance }) => attendance);
  const { timezone = "Asia/Manila" } = auth;
  const dispatch = useDispatch();
  const setPage = (page) => {
    dispatch(BROWSE({ page, limit: pagination.limit }));
  };
  const setLimit = (limit) => {
    dispatch(BROWSE({ page: pagination.page, limit }));
  };

  return (
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
            {/* Mobile view */}
            <div className="grid gap-3 md:hidden">
              {collections.map((record, index) => (
                <HistoryCard
                  key={record.id || `${record.userId}-${index}`}
                  record={record}
                  timezone={timezone}
                />
              ))}
            </div>
            {/* Full view */}
            <div className="hidden overflow-hidden rounded-md border md:block">
              <HistoryTable />
            </div>
            <Pagination
              title="Attendance"
              pagination={pagination}
              setPage={setPage}
              setLimit={setLimit}
            />
          </>
        ) : (
          <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            No attendance records yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(AttHistory);

const HistoryCard = memo(({ record, timezone = "Asia/Manila" }) => (
  <div className="rounded-md border bg-background p-3 shadow-xs">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium">
          {Formatter.date(record.timeIn, false, timezone)}
        </p>
        <p className="text-xs text-muted-foreground">
          {Formatter.time(record.timeIn, timezone)} -{" "}
          {Formatter.time(record.timeOut, timezone)}
        </p>
      </div>
      <AttendanceStatus status={record.status} />
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-muted/30 p-2 text-sm">
      <MobileHistoryMetric
        label="In"
        value={Formatter.time(record.timeIn, timezone)}
      />
      <MobileHistoryMetric
        label="Out"
        value={Formatter.time(record.timeOut, timezone)}
      />
      <MobileHistoryMetric
        label="Total"
        value={
          record?.timeOut
            ? Formatter.duration(record.totalLoggedMinutes || 0)
            : "-"
        }
      />
    </div>
    <Collapsible className="group/summary mt-3 rounded-md border bg-muted/10">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto w-full justify-between px-3 py-2 text-left hover:bg-muted/40"
        >
          <span>
            <span className="block text-sm font-semibold">Daily Summary</span>
            <span className="block text-xs text-muted-foreground tabular-nums">
              {record?.workDate || "Breakdown"}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]/summary:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {utils.buildAttSummaryItems(record).map((item) => (
            <DailySummaryTile key={item.label} {...item} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
));

const MobileHistoryMetric = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="truncate font-medium tabular-nums">{value}</p>
  </div>
);
