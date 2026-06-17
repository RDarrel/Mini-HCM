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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye, ReceiptText } from "lucide-react";
import ViewTransaction from "./view";

const Body = ({ isDeleted = false }) => {
  const { filtered: transactions, isLoading } = useSelector(
      ({ transactions }) => transactions
    ),
    [isOpen, setIsOpen] = React.useState(false),
    [selected, setSelected] = React.useState({});

  const filtered = transactions.filter(({ deletedAt }) => {
    if (isDeleted) {
      return deletedAt;
    } else {
      return !deletedAt;
    }
  });
  return (
    <>
      <CardContent>
        {!isLoading ? (
          <div className="flex items-center -mt-3">
            <div>
              <h2 className="text-[1.3rem] text-[#FF4F00] font-[500]">
                {format.peso(
                  filtered?.reduce((acc, item) => acc + item.amount, 0)
                )}
              </h2>
            </div>
            <div className="flex-grow border-dashed border-t border-[#FF4F00] mx-2"></div>
            <div>
              <h2 className="text-[1.3rem] text-[#FF4F00] font-[500]">
                @{filtered?.length} Customer/s{" "}
              </h2>
            </div>
          </div>
        ) : (
          <Skeleton className="w-full h-8" />
        )}
        {!isLoading ? (
          <div className="border rounded-md bg-white mt-3">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Fuels</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Created At</TableHead>
                    {!isDeleted ? (
                      <TableHead>Action</TableHead>
                    ) : (
                      <TableHead>Deleted At</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length > 0 ? (
                    filtered.map((item, index) => {
                      const { cashier, amount, cart, cash, reason } = item;
                      const { fullName = {} } = cashier || {};

                      return (
                        <React.Fragment key={index}>
                          <TableRow>
                            <TableCell>{`${fullName.fname} ${fullName?.lname[0]}.`}</TableCell>
                            <TableCell>
                              {cart.map((item) => {
                                const { fuel, amount } = item;
                                return (
                                  <div>
                                    <span>
                                      {fuel?.name} - {format.peso(amount)}
                                    </span>
                                  </div>
                                );
                              })}
                            </TableCell>
                            <TableCell>
                              <div>Amount: {format.peso(amount)}</div>
                              <div>
                                <span className="text-[0.8rem]">
                                  Cash: {format.peso(cash)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formattedDate(item.createdAt, true)}
                            </TableCell>
                            {!isDeleted ? (
                              <TableCell>
                                <Button
                                  onClick={() => {
                                    setSelected(item);
                                    setIsOpen(true);
                                  }}
                                  title="View Transaction"
                                  className={
                                    "bg-[#FF4F00]  hover:bg-[#e64500] cursor-pointer"
                                  }
                                >
                                  <ReceiptText />
                                </Button>
                              </TableCell>
                            ) : (
                              <TableCell>
                                {formattedDate(item.deletedAt, true)}
                              </TableCell>
                            )}
                          </TableRow>
                          {isDeleted && (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className={"m-0 p-0 px-2 "}
                              >
                                <span className="text-red-700   italic max-w-[70rem] break-words whitespace-normal">
                                  {reason}
                                </span>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No Transcactions Record.
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

      <ViewTransaction
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selected={selected}
      />
    </>
  );
};

export default Body;
