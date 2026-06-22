import { memo } from "react";
import { Formatter } from "@/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pen } from "lucide-react";
import StatusBadge from "@/components/shared/statusBadge";
const Employee = ({ employee, handleSelected = () => {} }) => {
  return (
    <TableRow key={employee.userId} className="hover:bg-muted/30">
      <TableCell>
        <div className="font-medium">
          {Formatter.fullName(employee?.user?.name)}
        </div>
      </TableCell>
      <TableCell>
        {Formatter.time(employee.timeIn, employee.timezone)}
      </TableCell>
      <TableCell className="tabular-nums">
        {Formatter.time(employee.timeOut, employee.timezone)}
      </TableCell>
      <TableCell className="font-medium tabular-nums">
        <StatusBadge status={employee.status} />
      </TableCell>
      <TableCell className="font-medium tabular-nums">
        <Button size="icon" onClick={() => handleSelected(employee)}>
          <Pen className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default memo(Employee);
