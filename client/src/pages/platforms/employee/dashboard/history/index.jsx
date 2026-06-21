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
import { Skeleton } from "@/components/ui/skeleton";
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
            {/* Mobile view loading */}
            <div className="grid gap-3 md:hidden">
              {new Array(3).fill("").map((_, index) => (
                <HistoryCardSkeleton key={index} />
              ))}
            </div>
            {/* Full view loading */}
            <div className="hidden overflow-hidden  md:block">
              <TableSkeleton numberOfColumns={6} />
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

const HistoryCardSkeleton = () => (
  <div className="rounded-md border bg-background p-3 shadow-xs">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Skeleton className="h-6 w-24 rounded-md" />
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-muted/30 p-2">
      {new Array(3).fill("").map((_, index) => (
        <div key={index} className="min-w-0 space-y-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
    <div className="mt-3 rounded-md border bg-muted/10 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="size-4 rounded-full" />
      </div>
    </div>
  </div>
);
