import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { ATTENDANCE_STATUS } from "@/constants";

const DailySummaryTile = ({ icon, label, value }) => {
  const SummaryIcon = icon;

  return (
    <div className="min-w-0 rounded-md border bg-background p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <SummaryIcon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
};
const AttendanceStatus = ({ status }) => {
  const { variant, label } =
    ATTENDANCE_STATUS[status?.toLowerCase()] || ATTENDANCE_STATUS.in_progress;

  return (
    <Badge variant={variant} className="inline-flex gap-1.5 rounded-md">
      {label === "Completed" && <CheckCircle2 className="size-3" />}
      {label}
    </Badge>
  );
};

export { AttendanceStatus, DailySummaryTile };
