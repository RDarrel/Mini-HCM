import { memo } from "react";
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
import { CheckCircle2, History } from "lucide-react";
import { useSelector } from "react-redux";
import { Formatter } from "@/services/utilities";
import Pagination from "@/components/shared/pagination";
import { useDispatch } from "react-redux";
import { BROWSE } from "@/services/redux/slices/attendance";
import { ATTENDANCE_STATUS } from "@/constants";

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
                          {Formatter.date(record.timeIn, false, timezone)}
                        </div>
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
                              Fomatter.duration(record.totalLoggedMinutes),
                            )
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
  <div className="rounded-md border bg-background p-3">
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
            ? Formatter.duration(Fomatter.duration(record.totalLoggedMinutes))
            : "-"
        }
      />
    </div>
  </div>
));

const AttendanceStatus = ({ status }) => {
  const { variant, label } = ATTENDANCE_STATUS[status.toLowerCase()];
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
