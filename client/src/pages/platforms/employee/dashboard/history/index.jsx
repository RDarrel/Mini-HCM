import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History } from "lucide-react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { BROWSE } from "@/services/redux/slices/attendance";
import { TableSkeleton } from "@/components/shared/skeleton";

import Pagination from "@/components/shared/pagination";
import HistoryTable from "./table";
import HistoryCard from "./card";
const AttHistory = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const {
    collections = [],
    isBrowsing: isLoading,
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
          <>
            <div className="grid gap-3 md:hidden">
              <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                Loading attendance records...
              </div>
            </div>
            <div className="hidden overflow-hidden  md:block">
              <TableSkeleton />
            </div>
          </>
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
