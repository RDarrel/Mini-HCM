import Pagination from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter } from "@/services/utilities";
import { RECORDS } from "@/services/redux/slices/attendance";
import { CalendarX } from "lucide-react";
import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

const TableRecords = ({ params, reportType = "Daily" }) => {
  const {
    collections = [],
    pagination,
    isFetchingList = false,
  } = useSelector(({ attendance }) => attendance);
  const dispatch = useDispatch();

  const requestParams = useMemo(
    () => ({
      ...params,
      limit: pagination.limit,
    }),
    [pagination.limit, params],
  );

  const setPage = (page) => {
    if (!params) return;

    dispatch(RECORDS({ ...requestParams, page }));
  };

  const setLimit = (limit) => {
    if (!params) return;

    dispatch(RECORDS({ ...requestParams, page: 1, limit }));
  };

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Regular Hours</TableHead>
              <TableHead className="text-right">Overtime Hours</TableHead>
              <TableHead className="text-right">Late</TableHead>
              <TableHead className="text-right">Undertime</TableHead>
              <TableHead className="text-right">Night Differential</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {isFetchingList ? (
            <TableSkeleton numberOfRows={5} numberOfColumns={7} />
          ) : collections.length ? (
            collections.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {Formatter.fullName(report?.user?.name)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Formatter.duration(report?.regularMinutes || 0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Formatter.duration(report?.overtimeMinutes || 0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Formatter.duration(report?.lateMinutes || 0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Formatter.duration(report?.undertimeMinutes || 0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Formatter.duration(report?.nightDifferentialMinutes || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="rounded-md">
                      {report.status || "Recorded"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyRecords />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        pagination={pagination}
        setPage={setPage}
        setLimit={setLimit}
        title={`${reportType} Report`}
      />
    </>
  );
};

export default TableRecords;

const EmptyRecords = () => (
  <div className="flex items-center justify-center gap-3 px-4 py-6">
    <div className="shrink-0 rounded-md border bg-muted/20 p-2">
      <CalendarX className="size-5 text-muted-foreground" />
    </div>
    <div>
      <p className="text-sm font-medium">No reports found</p>
      <p className="text-xs text-muted-foreground">
        Try another date range or search term.
      </p>
    </div>
  </div>
);
