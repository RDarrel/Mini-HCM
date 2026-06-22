import { Gauge, FileBarChart, CalendarCheck2 } from "lucide-react";
import Dashboard from "./dashboard";
import Reports from "./reports";
import AttendanceRecords from "./attendance";
const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Dashboard,
  },
  {
    name: "Attendance Records",
    path: "/attendance-records",
    icon: CalendarCheck2,
    component: AttendanceRecords,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileBarChart,
    component: Reports,
  },
];

export default access;
