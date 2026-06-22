import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";
import { Formatter } from "@/services/utilities";
import { useSelector, useDispatch } from "react-redux";
import { TableSkeleton } from "@/components/shared/skeleton";
import { RECORDS } from "@/services/redux/slices/attendance";
import Pagination from "@/components/shared/pagination";
import { CalendarX } from "lucide-react";

const EmployeeRecords = ({ from, to }) => {
  const {
    collections,
    pagination,
    isFetchingList = false,
  } = useSelector(({ attendance }) => attendance);
  const dispatch = useDispatch();

  const paginationParams = useMemo(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      from,
      to,
    }),
    [pagination.page, pagination.limit, from, to],
  );

  const setPage = (page) => dispatch(RECORDS({ ...paginationParams, page }));
  const setLimit = (limit) => dispatch(RECORDS({ ...paginationParams, limit }));
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Today&apos;s Attendance Records</CardTitle>
        <CardDescription>Employees with records today.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-hidden rounded-md border">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Employee</TableHead>
                <TableHead>Punch In</TableHead>
                <TableHead>Punch Out</TableHead>
                <TableHead>Total Logged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetchingList ? (
                <TableSkeleton numberOfRows={2} numberOfColumns={4} />
              ) : collections?.length > 0 ? (
                collections.map((employee) => (
                  <TableRow key={employee.userId} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="font-medium">
                        {Formatter.fullName(employee?.user?.name)}
                      </div>
                    </TableCell>
                    <TableCell>{Formatter.time(employee.timeIn)}</TableCell>
                    <TableCell className="tabular-nums">
                      {Formatter.time(employee.timeOut)}
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {Formatter.duration(employee.totalLoggedMinutes)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="p-0">
                    <EmptyRecords />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination
          title="Employee Record"
          setPage={setPage}
          setLimit={setLimit}
          pagination={pagination}
        />
      </CardContent>
    </Card>
  );
};

export default EmployeeRecords;

const EmptyRecords = () => (
  <div className="flex items-center justify-center gap-3 px-4 py-6">
    <div className="shrink-0 rounded-md border bg-muted/20 p-2">
      <CalendarX className="size-5 text-muted-foreground" />
    </div>
    <div>
      <p className="text-sm font-medium">No attendance records yet</p>
      <p className="text-xs text-muted-foreground">
        Records will appear here once employees punch in.
      </p>
    </div>
  </div>
);
