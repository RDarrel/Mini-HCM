import { Formatter } from "@/services/utilities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { useSelector } from "react-redux";
import TodaySummarySkeleton from "./skeleton";

const TodaySummary = ({
  summaryItems,
  todayRecord,
  workedMinutes,
  timezone = "Asia/Manila",
}) => {
  const { isFetchingItem: isLoading } = useSelector(
    ({ attendance }) => attendance,
  );
  console.log("summaryItems", summaryItems);
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
        {isLoading ? (
          <TodaySummarySkeleton />
        ) : (
          <>
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
                value={Formatter.time(todayRecord?.timeIn, timezone)}
              />
              <PunchCell
                label="Punch Out"
                value={Formatter.time(todayRecord?.timeOut, timezone)}
              />
              <PunchCell
                label="Total Logged"
                value={Formatter.duration(workedMinutes)}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaySummary;

const PunchCell = ({ label, value }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 font-semibold tabular-nums">{value}</p>
  </div>
);

const SummaryBox = ({ icon, label, value }) => {
  const SummaryIcon = icon;

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {SummaryIcon && (
          <SummaryIcon className="size-4 text-muted-foreground" />
        )}
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
};
