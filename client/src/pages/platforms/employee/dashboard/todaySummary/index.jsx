import { PunchCell, SummaryBox } from "../components";
import { Formatter } from "@/services/utilities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

const TodaySummary = ({
  progress,
  summaryItems,
  todayRecord,
  workedMinutes,
}) => {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Today&apos;s Summary</CardTitle>
            <CardDescription>
              Breakdown for the current workday.
            </CardDescription>
          </div>
          <ClipboardList className="mt-1 size-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {summaryItems.map((item) => (
            <SummaryBox
              key={item.label}
              icon={item.icon}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
        <div className="grid gap-3 rounded-md border bg-muted/20 p-3 sm:grid-cols-3">
          <PunchCell
            label="Punch In"
            value={Formatter.time(todayRecord?.timeIn)}
          />
          <PunchCell
            label="Punch Out"
            value={Formatter.time(todayRecord?.timeOut)}
          />
          <PunchCell
            label="Total Logged"
            value={Formatter.duration(workedMinutes)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaySummary;
