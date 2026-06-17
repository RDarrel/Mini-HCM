import React from "react";
import { Card } from "@/components/ui/card";

import Header from "./header";
import Body from "./body";
import FuelBreakdown from "./Breakdown";
import { useSelector } from "react-redux";

const Transactions = () => {
  const { filtered: transactions, isLoading } = useSelector(
    ({ transactions }) => transactions
  );
  const hasDeleted = transactions?.some(({ deletedAt }) => deletedAt);
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Card>
          <Header />
          <Body />
        </Card>
        {hasDeleted && !isLoading && (
          <div className="mt-2">
            <Card>
              <Header isDeleted />
              <Body isDeleted />
            </Card>
          </div>
        )}
      </div>
      <div className="w-70">
        <FuelBreakdown />
      </div>
    </div>
  );
};

export default Transactions;
