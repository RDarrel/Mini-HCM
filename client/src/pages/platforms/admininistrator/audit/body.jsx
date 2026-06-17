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
import { capitalize, formattedDate } from "@/services/utilities";
import { useSelector } from "react-redux";
import TableLoading from "@/components/shared/loading/table";
import { Badge } from "@/components/ui/badge";
const Body = () => {
  const { filtered, isLoading, collections, chosenRoles } = useSelector(
    ({ audit }) => audit,
  );
  return (
    <>
      <CardContent>
        {!isLoading ? (
          <div className="border rounded-md bg-white ">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length > 0 ? (
                    filtered.map((item, index) => {
                      const { user, role, action, description } = item;
                      const { fullName = {} } = user || {};

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <span className="text-[#FF4F00] font-[500]">
                              {`${fullName.fname} ${fullName.lname[0]}.`}
                            </span>
                            <Badge className="block" variant="secondary">
                              {capitalize(role)}
                            </Badge>
                          </TableCell>
                          <TableCell>{capitalize(action)}</TableCell>
                          <TableCell className="max-w-[200px] whitespace-normal break-words">
                            {description}
                          </TableCell>
                          <TableCell>
                            {formattedDate(item.createdAt, true)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        {collections?.length > 0
                          ? chosenRoles.length > 0
                            ? "No search results. Try different keywords."
                            : "Please select at least one role to filter the results."
                          : "No Audit Records Found."}
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
    </>
  );
};

export default Body;
