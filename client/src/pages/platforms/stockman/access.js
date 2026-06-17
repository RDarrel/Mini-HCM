import {
  ClipboardList,
  Gauge,
  GitPullRequestArrow,
  Package,
} from "lucide-react";
import Dashboard from "./dashboard";
import RequestStock from "./request-stock/create-request";
import MyRequests from "./request-stock/my-requests";
import orderList from "./orders/order-list";
import shortDeliveries from "./orders/short-deliveries";
import Inventory from "../admininistrator/inventory";

const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Dashboard,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Package,
    component: Inventory,
  },
  {
    name: "Stock Requests",
    path: "/stock-requests",
    icon: ClipboardList,
    children: [
      {
        name: "Create Request",
        path: "/create-request",
        component: RequestStock,
      },
      {
        name: "My Requests",
        path: "/My-Requests",
        component: MyRequests,
      },
    ],
  },
  {
    name: "Orders",
    path: "/orders",
    icon: GitPullRequestArrow,
    children: [
      {
        name: "Order-List",
        path: "/order-list",
        component: orderList,
      },
      {
        name: "Short Deliveries",
        path: "/short-deliveries",
        component: shortDeliveries,
      },
    ],
  },
];

export default access;
