import {
  AlertTriangle,
  CalendarCheck,
  Clock3,
  LogOut,
  Moon,
  UserMinus,
  Users,
} from "lucide-react";

const getPercentage = (value, total) => {
  if (total <= 0) return 0;

  return Math.round((value / total) * 100);
};
const buildSummaryItems = (summary) => {
  const {
    totalEmployees,
    presentToday,
    absentToday,
    lateToday,
    employeesWithOT,
    employeesWithND,
    currentlyWorking,
    completedShifts,
  } = summary;

  const attendanceRate =
    totalEmployees > 0 ? getPercentage(presentToday, totalEmployees) : 0;

  const absenceRate =
    totalEmployees > 0 ? getPercentage(absentToday, totalEmployees) : 0;

  const attendanceKpis = [
    {
      label: "Total Employees",
      value: totalEmployees,
      helper: "Active employees",
      icon: Users,
    },
    {
      label: "Present Today",
      value: presentToday,
      helper: `${attendanceRate}% attendance rate`,
      icon: CalendarCheck,
    },
    {
      label: "Absent Today",
      value: absentToday,
      helper: `${absenceRate}% of workforce`,
      icon: UserMinus,
    },
    {
      label: "Late Today",
      value: lateToday,
      helper: "Employees late today",
      icon: Clock3,
    },
  ];

  const shiftKpis = [
    {
      label: "Currently Working",
      value: currentlyWorking,
      helper: "Active sessions",
      icon: Clock3,
    },
    {
      label: "Completed Shifts",
      value: completedShifts,
      helper: "Punched out today",
      icon: LogOut,
    },
    {
      label: "Employees with OT",
      value: employeesWithOT,
      helper: "Employees with overtime",
      icon: AlertTriangle,
    },
    {
      label: "Employees with ND",
      value: employeesWithND,
      helper: "Employees with night differential",
      icon: Moon,
    },
  ];

  return { attendanceKpis, shiftKpis };
};

export default buildSummaryItems;
