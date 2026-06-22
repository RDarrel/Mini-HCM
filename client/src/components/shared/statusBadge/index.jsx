import { Badge } from "@/components/ui/badge";
import { ATTENDANCE_STATUS } from "@/constants";
import { CheckCircle2 } from "lucide-react";
const StatusBadge = ({ status }) => {
  const { variant, label } =
    ATTENDANCE_STATUS[status?.toLowerCase()] || ATTENDANCE_STATUS.in_progress;

  return (
    <Badge variant={variant} className="inline-flex gap-1.5 rounded-md">
      {label === "Completed" && <CheckCircle2 className="size-3" />}
      {label}
    </Badge>
  );
};

export default StatusBadge;
