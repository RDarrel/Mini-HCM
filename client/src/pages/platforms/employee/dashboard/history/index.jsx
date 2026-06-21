import { Fragment, memo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  CalendarClock,
  ChevronDown,
  CheckCircle2,
  Clock3,
  History,
  Moon,
  Timer,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Formatter } from "@/services/utilities";
import Pagination from "@/components/shared/pagination";
import { useDispatch } from "react-redux";
import { BROWSE } from "@/services/redux/slices/attendance";
import { ATTENDANCE_STATUS } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const getSummaryItems = (record) => [
  {
    label: "Regular",
    value: Formatter.duration(record?.regularMinutes || 0),
    icon: Clock3,
  },
  {
    label: "Overtime",
    value: Formatter.duration(record?.overtimeMinutes || 0),
    icon: Timer,
  },
  {
    label: "Late",
    value: Formatter.duration(record?.lateMinutes || 0),
    icon: Activity,
  },
  {
    label: "Undertime",
    value: Formatter.duration(record?.undertimeMinutes || 0),
    icon: CalendarClock,
  },
  {
    label: "Night Diff",
    value: Formatter.duration(record?.nightDiffMinutes || 0),
    icon: Moon,
  },
];

const AttHistory = () => {
  const [expandedRecordId, setExpandedRecordId] = useState(null);
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
  const toggleRecord = (recordId) => {
    setExpandedRecordId((currentId) =>
      currentId === recordId ? null : recordId,
    );
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
            <div className="grid gap-3 md:hidden">
              {collections.map((record, index) => (
                <HistoryCard
                  key={record.id || `${record.userId}-${index}`}
                  record={record}
                  timezone={timezone}
                />
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-md border md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[18%]">Date</TableHead>
                    <TableHead>Punch In</TableHead>
                    <TableHead>Punch Out</TableHead>
                    <TableHead>Total Logged</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-40 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((record, index) => {
                    const recordId = record.id || `${record.userId}-${index}`;
                    const isExpanded = expandedRecordId === recordId;

                    return (
                      <Fragment key={recordId}>
                        <TableRow className="hover:bg-muted/30">
                          <TableCell>
                            <div className="font-medium">
                              {Formatter.date(record.workDate, false, timezone)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {record?.workDate || ""}
                            </p>
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {Formatter.time(record.timeIn, timezone)}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {Formatter.time(record.timeOut, timezone)}
                          </TableCell>
                          <TableCell className="font-medium tabular-nums">
                            {record?.timeOut
                              ? Formatter.duration(
                                  record.totalLoggedMinutes || 0,
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <AttendanceStatus status={record.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              className={`h-8 min-w-32 gap-2 px-3 text-xs font-medium ${
                                isExpanded
                                  ? "bg-muted text-foreground hover:bg-muted"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                              }`}
                              onClick={() => toggleRecord(recordId)}
                              aria-expanded={isExpanded}
                            >
                              <span>
                                {isExpanded ? "Hide Summary" : "View Summary"}
                              </span>
                              <ChevronDown
                                className={`size-4 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/20 hover:bg-muted/20">
                            <TableCell colSpan={6} className="p-4">
                              <DailySummaryDetails
                                record={record}
                                timezone={timezone}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
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
          {getSummaryItems(record).map((item) => (
            <DailySummaryTile key={item.label} {...item} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
));

const AttendanceStatus = ({ status }) => {
  const { variant, label } =
    ATTENDANCE_STATUS[status?.toLowerCase()] || ATTENDANCE_STATUS.in_progress;

  return (
    <Badge variant={variant} className="inline-flex gap-1.5 rounded-md">
      {label === "Completed" && <CheckCircle2 className="size-3" />}
      {label}
    </Badge>
  );
};

const MobileHistoryMetric = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="truncate font-medium tabular-nums">{value}</p>
  </div>
);

const DailySummaryDetails = ({ record }) => (
  <div className="grid grid-cols-5 gap-3">
    {getSummaryItems(record).map((item) => (
      <DailySummaryTile key={item.label} {...item} />
    ))}
  </div>
);

const DailySummaryTile = ({ icon, label, value }) => {
  const SummaryIcon = icon;

  return (
    <div className="min-w-0 rounded-md border bg-background p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <SummaryIcon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
};
