import { memo } from "react";
import { Formatter } from "@/utilities";
import { DailySummaryTile } from "../components";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import utils from "../../utils";
import StatusBadge from "@/components/shared/statusBadge";

const HistoryCard = memo(({ record, timezone = "Asia/Manila" }) => (
  <div className="rounded-md border bg-background p-3 shadow-xs">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium">
          {Formatter.date(record.timeIn, false, timezone)}
        </p>
        <p className="text-xs text-muted-foreground">
          {Formatter.time(record.timeIn, timezone)} -{" "}
          {Formatter.time(record.timeOut, timezone)}
        </p>
      </div>
      <StatusBadge status={record.status} />
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-muted/30 p-2 text-sm">
      <MobileHistoryMetric
        label="In"
        value={Formatter.time(record.timeIn, timezone)}
      />
      <MobileHistoryMetric
        label="Out"
        value={Formatter.time(record.timeOut, timezone)}
      />
      <MobileHistoryMetric
        label="Total"
        value={
          record?.timeOut
            ? Formatter.duration(record.totalLoggedMinutes || 0)
            : "-"
        }
      />
    </div>
    <Collapsible className="group/summary mt-3 rounded-md border bg-muted/10">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto w-full justify-between px-3 py-2 text-left hover:bg-muted/40"
        >
          <span>
            <span className="block text-sm font-semibold">Daily Summary</span>
            <span className="block text-xs text-muted-foreground tabular-nums">
              {record?.workDate || "Breakdown"}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]/summary:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {utils.buildAttSummaryItems(record).map((item) => (
            <DailySummaryTile key={item.label} {...item} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
));

export default memo(HistoryCard);

const MobileHistoryMetric = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="truncate font-medium tabular-nums">{value}</p>
  </div>
);
