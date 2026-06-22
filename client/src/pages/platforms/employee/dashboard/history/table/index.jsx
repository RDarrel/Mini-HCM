import { Fragment, memo, useCallback, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelector } from "react-redux";
import { Formatter } from "@/utilities";
import { DailySummaryTile } from "../components";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import utils from "../../utils";
import StatusBadge from "@/components/shared/statusBadge";

const HistoryTable = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const { timezone = "Asia/Manila" } = auth;
  const { collections } = useSelector(({ attendance }) => attendance);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  const toggleRecord = useCallback((recordId) => {
    setExpandedRecordId((currentId) =>
      currentId === recordId ? null : recordId,
    );
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="w-[18%]">Date</TableHead>
          <TableHead>Punch In</TableHead>
          <TableHead>Punch Out</TableHead>
          <TableHead>Total Logged</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-40 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collections.map((record, index) => {
          const recordId = record.id || `${record.userId}-${index}`;
          const isExpanded = expandedRecordId === recordId;

          return (
            <HistoryTableRow
              key={record.id}
              record={record}
              isExpanded={isExpanded}
              timezone={timezone}
              toggleRecord={toggleRecord}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};

export default HistoryTable;

const HistoryTableRow = memo(
  ({ record, isExpanded, timezone, toggleRecord = () => {} }) => {
    return (
      <Fragment key={record.id}>
        <TableRow className="hover:bg-muted/30">
          <TableCell>
            <div className="font-medium">
              {Formatter.date(record.workDate, false, timezone)}
            </div>
          </TableCell>
          <TableCell className="tabular-nums">
            {Formatter.time(record.timeIn, timezone)}
          </TableCell>
          <TableCell className="tabular-nums">
            {Formatter.time(record.timeOut, timezone)}
          </TableCell>
          <TableCell className="font-medium tabular-nums">
            {record?.timeOut
              ? Formatter.duration(record.totalLoggedMinutes || 0)
              : "-"}
          </TableCell>
          <TableCell>
            <StatusBadge status={record.status} />
          </TableCell>
          <TableCell className="text-right">
            <Button
              variant="ghost"
              className={`h-8 min-w-32 gap-2 px-3 text-xs font-medium ${
                isExpanded
                  ? "bg-muted text-foreground hover:bg-muted"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
              onClick={() => toggleRecord(record.id)}
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? "Hide Summary" : "View Summary"}</span>
              <ChevronDown
                className={`size-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </TableCell>
        </TableRow>
        {isExpanded && (
          <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableCell colSpan={6} className="p-4">
              <DailySummaryDetails record={record} timezone={timezone} />
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    );
  },
);

const DailySummaryDetails = ({ record }) => (
  <div className="grid grid-cols-5 gap-3">
    {utils.buildAttSummaryItems(record).map((item) => (
      <DailySummaryTile key={item.label} {...item} />
    ))}
  </div>
);
