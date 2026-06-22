import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import { TableSkeleton } from "@/components/shared/skeleton";
import { RECORDS } from "@/services/redux/slices/attendance";
import Pagination from "@/components/shared/pagination";
import { CalendarX } from "lucide-react";
import CustomDatePicker from "@/components/shared/datepicker";
import DebouncedInput from "@/components/shared/debouncedInput";
import { toISODate } from "@/services/utilities";
import Employee from "./employee";
import EmployeeModal from "./modal";

const Attendance = () => {
  const { auth } = useSelector(({ auth }) => auth),
    {
      collections,
      pagination,
      isFetchingList = false,
    } = useSelector(({ attendance }) => attendance),
    [selected, setSelected] = useState({}),
    [openModal, setOpenModal] = useState(false),
    [search, setSearch] = useState(""),
    [date, setDate] = useState(new Date()),
    limitRef = useRef(pagination.limit),
    dispatch = useDispatch();

  const recordParams = useMemo(() => {
    const keyword = search ? { search } : {};

    return {
      from: toISODate(date, auth.timezone),
      to: toISODate(date, auth.timezone),
      ...keyword,
    };
  }, [date, search, auth.timezone]);

  useEffect(() => {
    if (!recordParams) return;

    dispatch(
      RECORDS({
        ...recordParams,
        page: 1,
        limit: limitRef.current,
      }),
    );
  }, [dispatch, recordParams]);

  const toggleModal = () => setOpenModal(!openModal);

  const handleSelected = useCallback((employee) => {
    setSelected(employee);
    toggleModal();
  }, []);

  const setPage = (page) => dispatch(RECORDS({ ...recordParams, page }));
  const setLimit = (limit) =>
    dispatch(RECORDS({ ...recordParams, page: 1, limit }));
  return (
    <main className="min-h-[calc(100vh-3.25rem)] p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-col gap-3 pb-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Attendance Logs</CardTitle>
              <CardDescription className="mt-2">
                View and manage employee punch in and punch out records.
              </CardDescription>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
              <CustomDatePicker date={date} setDate={setDate} />
              <DebouncedInput value={search} onDebounce={setSearch} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-hidden rounded-md border">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Employee</TableHead>
                    <TableHead>Punch In</TableHead>
                    <TableHead>Punch Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetchingList ? (
                    <TableSkeleton numberOfRows={5} numberOfColumns={5} />
                  ) : collections?.length > 0 ? (
                    collections.map((employee) => (
                      <Employee
                        employee={employee}
                        key={employee?.userId}
                        handleSelected={handleSelected}
                      />
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
      </div>
      <EmployeeModal
        isOpen={openModal}
        setIsOpen={setOpenModal}
        selected={selected}
      />
    </main>
  );
};

export default Attendance;

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
