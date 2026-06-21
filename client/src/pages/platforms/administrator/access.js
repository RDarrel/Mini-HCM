import { Gauge, FileBarChart } from "lucide-react";
import Dashboard from "./dashboard";
import Reports from "./reports";
const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Dashboard,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileBarChart,
    component: Reports,
  },
];

export default access;
