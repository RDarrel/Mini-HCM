import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";
import { format, formattedDate } from "@/services/utilities";
import { useSelector } from "react-redux";
import TableLoading from "@/components/shared/loading/table";
import Summary from "./summary";
const Body = () => {
  const { filtered, isLoading, frequency } = useSelector(({ deals }) => deals);
  const isDaily = frequency === "daily";
  return (
    <CardContent>
      <Summary />
      {!isLoading ? (
        <div className="border rounded-md bg-white mt-3">
          <div className="max-h-96 overflow-y-auto">
            <Table className={"sticky top-0"}>
              <TableHeader>
                <TableRow>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Liters</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((item, index) => {
                    const { date, total, solds = [] } = item;

                    return (
                      <React.Fragment key={index}>
                        <TableRow
                          className={
                            "bg-gray-200 hover:bg-gray-300 text-black "
                          }
                        >
                          <TableCell colSpan={4}>
                            <div className="flex justify-between ">
                              <span className="block">{date}</span>
                              <span className="block">
                                {format.peso(total)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                        {solds.map((item, cIdx) => {
                          const {
                            fuel = {},
                            amount = 0,
                            createdAt,
                            srp,
                          } = item;
                          return (
                            <TableRow key={`sold-${cIdx}`}>
                              <TableCell>{fuel?.name}</TableCell>
                              <TableCell>{format.peso(amount)}</TableCell>
                              <TableCell>
                                {format.liters(amount, srp)} L
                              </TableCell>
                              <TableCell>
                                {!isDaily
                                  ? formattedDate(createdAt, true)
                                  : new Date(createdAt).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No Transactions Record.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <TableLoading numberOfColumns={4} className="mt-3" />
      )}
    </CardContent>
  );
};

export default Body;
