import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Search } from "lucide-react";

const dailyReports = [
  {
    id: "D-001",
    period: "Jun 22, 2026",
    employees: 248,
    present: 221,
    absent: 27,
    late: 18,
    overtime: 23,
    nightDiff: 11,
    status: "Ready",
  },
  {
    id: "D-002",
    period: "Jun 21, 2026",
    employees: 248,
    present: 226,
    absent: 22,
    late: 14,
    overtime: 19,
    nightDiff: 9,
    status: "Ready",
  },
  {
    id: "D-003",
    period: "Jun 20, 2026",
    employees: 246,
    present: 218,
    absent: 28,
    late: 21,
    overtime: 17,
    nightDiff: 10,
    status: "Reviewed",
  },
];

const weeklyReports = [
  {
    id: "W-001",
    period: "Jun 16 - Jun 22, 2026",
    employees: 248,
    present: 1128,
    absent: 108,
    late: 72,
    overtime: 91,
    nightDiff: 44,
    status: "Ready",
  },
  {
    id: "W-002",
    period: "Jun 9 - Jun 15, 2026",
    employees: 246,
    present: 1096,
    absent: 116,
    late: 81,
    overtime: 77,
    nightDiff: 39,
    status: "Reviewed",
  },
];

const years = ["2026", "2025", "2024"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const getWeeks = (year, month) => {
  const monthIndex = months.indexOf(month);
  const lastDay = new Date(Number(year), monthIndex + 1, 0).getDate();
  const ranges = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, 28],
    [29, lastDay],
  ];

  return ranges
    .filter(([start]) => start <= lastDay)
    .map(([start, end], index) => ({
      value: String(index + 1),
      label: `Week ${index + 1} (${start}-${end})`,
    }));
};

const formatDate = (date) =>
  date
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Select date";

const Reports = () => {
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("daily");
  const [dailyDate, setDailyDate] = useState(new Date(2026, 5, 22));
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("June");
  const [week, setWeek] = useState("4");

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
                  {reportType === "daily" ? (
                    <DatePicker date={dailyDate} setDate={setDailyDate} />
                  ) : (
                    <WeeklyFilters
                      year={year}
                      month={month}
                      week={week}
                      setYear={setYear}
                      setMonth={setMonth}
                      setWeek={setWeek}
                    />
                  )}
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
                <ReportsTable reports={dailyReports} search={search} />
              </TabsContent>
              <TabsContent value="weekly">
                <ReportsTable reports={weeklyReports} search={search} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Reports;

const DatePicker = ({ date, setDate }) => (
  <DatePickerContent date={date} setDate={setDate} />
);

const DatePickerContent = ({ date, setDate }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal sm:w-40",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" />
          {formatDate(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (!selectedDate) return;

            setDate(selectedDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

const WeeklyFilters = ({ year, month, week, setYear, setMonth, setWeek }) => (
  <div className="grid grid-cols-3 gap-2 sm:flex">
    <Select value={year} onValueChange={setYear}>
      <SelectTrigger className="w-full sm:w-28">
        <SelectValue placeholder="Year" />
      </SelectTrigger>
      <SelectContent>
        {years.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select value={month} onValueChange={setMonth}>
      <SelectTrigger className="w-full sm:w-36">
        <SelectValue placeholder="Month" />
      </SelectTrigger>
      <SelectContent>
        {months.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select value={week} onValueChange={setWeek}>
      <SelectTrigger className="w-full sm:w-24">
        <SelectValue placeholder="Week" />
      </SelectTrigger>
      <SelectContent>
        {getWeeks(year, month).map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ReportsTable = ({ reports, search }) => {
  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return reports;

    return reports.filter((report) =>
      [report.id, report.period, report.status].some((value) =>
        String(value).toLowerCase().includes(keyword),
      ),
    );
  }, [reports, search]);

  return (
    <div className="overflow-hidden rounded-md border">
      <Table className="min-w-[860px]">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Report</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead className="text-right">Present</TableHead>
            <TableHead className="text-right">Absent</TableHead>
            <TableHead className="text-right">Late</TableHead>
            <TableHead className="text-right">OT</TableHead>
            <TableHead className="text-right">ND</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReports.length ? (
            filteredReports.map((report) => (
              <TableRow key={report.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>{report.period}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {report.employees}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {report.present}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {report.absent}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {report.late}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {report.overtime}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {report.nightDiff}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="rounded-md">
                    {report.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                No reports found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
