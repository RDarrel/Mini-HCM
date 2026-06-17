import React from "react";

import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomCalendar from "./calendar";
import Cashiers from "./cashiers";

const Header = ({ isDeleted = false }) => {
  return (
    <CardHeader>
      <CardTitle>
        {isDeleted ? "Deleted Transactions" : "Transaction List"}
      </CardTitle>
      {!isDeleted && (
        <>
          <CardDescription>
            <CustomCalendar />
          </CardDescription>
          <CardAction>
            <Cashiers />
          </CardAction>
        </>
      )}
    </CardHeader>
  );
};

export default Header;
