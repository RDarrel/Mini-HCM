import {
  AlertTriangle,
  CalendarCheck,
  Clock3,
  LogOut,
  Moon,
  UserMinus,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const attendanceKpis = [
  {
    label: "Total Employees",
    value: "248",
    helper: "Active employees",
    icon: Users,
  },
  {
    label: "Present Today",
    value: "221",
    helper: "89% attendance rate",
    icon: CalendarCheck,
  },
  {
    label: "Absent Today",
    value: "27",
    helper: "11% of workforce",
    icon: UserMinus,
  },
  {
    label: "Late Today",
    value: "18",
    helper: "Employees late today",
    icon: Clock3,
  },
];

const shiftKpis = [
  {
    label: "Currently Working",
    value: "64",
    helper: "Active sessions",
    icon: Clock3,
  },
  {
    label: "Completed Shifts",
    value: "157",
    helper: "Punched out today",
    icon: LogOut,
  },
  {
    label: "Employees with OT",
    value: "23",
    helper: "Employees with overtime",
    icon: AlertTriangle,
  },
  {
    label: "Employees with ND",
    value: "11",
    helper: "Employees with night differential",
    icon: Moon,
  },
];

const presentEmployees = [
  {
    name: "Maria Santos",
    department: "Operations",
    punchIn: "08:52 AM",
    status: "Working",
    total: "3h 18m",
  },
  {
    name: "John Reyes",
    department: "Sales",
    punchIn: "09:14 AM",
    status: "Late",
    total: "2h 56m",
  },
  {
    name: "Anne Cruz",
    department: "Support",
    punchIn: "08:47 AM",
    status: "Working",
    total: "3h 23m",
  },
  {
    name: "Mark Dela Rosa",
    department: "Operations",
    punchIn: "07:58 AM",
    status: "Completed",
    total: "8h 04m",
  },
  {
    name: "Liza Mendoza",
    department: "Finance",
    punchIn: "08:59 AM",
    status: "Working",
    total: "3h 11m",
  },
];

const Dashboard = () => {
  return (
    <main className="min-h-[calc(100vh-3.25rem)] p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">
              Attendance Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily attendance overview across all employees.
            </p>
          </div>
          <Badge variant="outline" className="w-fit rounded-md">
            Today
          </Badge>
        </section>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Attendance</CardTitle>
                <CardDescription>
                  Workforce count and attendance status.
                </CardDescription>
              </div>
              <Users className="mt-1 size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {attendanceKpis.map((item) => (
                <AttendanceKpi key={item.label} {...item} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shift Monitoring</CardTitle>
                <CardDescription>
                  Current shift activity and premium attendance indicators.
                </CardDescription>
              </div>
              <Clock3 className="mt-1 size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {shiftKpis.map((item) => (
                <AttendanceKpi key={item.label} {...item} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Present Employees</CardTitle>
                <CardDescription>
                  Employees with attendance records for today.
                </CardDescription>
              </div>
              <div className="rounded-md border bg-muted/30 p-2">
                <CalendarCheck className="size-5 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Punch In</TableHead>
                    <TableHead>Total Logged</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presentEmployees.map((employee) => (
                    <TableRow key={employee.name} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-medium">{employee.name}</div>
                        <p className="text-xs text-muted-foreground">
                          Employee
                        </p>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="tabular-nums">
                        {employee.punchIn}
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">
                        {employee.total}
                      </TableCell>
                      <TableCell className="text-right">
                        <AttendanceStatus status={employee.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Dashboard;

const AttendanceKpi = ({ label, value, helper, icon }) => {
  const KpiIcon = icon;

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <KpiIcon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{helper}</p>
    </div>
  );
};

const AttendanceStatus = ({ status }) => {
  const statusClass = {
    Working: "border-transparent bg-primary text-primary-foreground",
    Completed: "border-transparent bg-secondary text-secondary-foreground",
    Late: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  };

  return (
    <Badge
      variant="outline"
      className={cn("rounded-md", statusClass[status])}
    >
      {status}
    </Badge>
  );
};
