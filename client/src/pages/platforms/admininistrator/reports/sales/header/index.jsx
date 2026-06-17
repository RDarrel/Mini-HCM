import React, { useState } from "react";

import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomCalendar from "./calendar";
import Frequency from "./frequency";
import { Button } from "@/components/ui/button";
import ExportSales from "@/services/utilities/export/excel/sales";
import { useSelector } from "react-redux";
import { fullName } from "@/services/utilities";
import { FileText } from "lucide-react";

const Header = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const { filtered, frequency, collections } = useSelector(
    ({ deals }) => deals
  );

  const [date, setDate] = useState(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7); // 1 week before today

    return {
      from: oneWeekAgo,
      to: today,
    };
  });

  return (
    <CardHeader>
      <CardTitle>Sales </CardTitle>
      <CardDescription>
        <CustomCalendar date={date} setDate={setDate} />
      </CardDescription>
      <CardAction>
        <div className="flex items-center gap-3">
          <Frequency />
          <Button
            className={"bg-[#FF4F00]  hover:bg-[#e64500] cursor-pointer"}
            title="Export Sales Report to Excel"
            disabled={!filtered.length}
            onClick={() =>
              ExportSales({
                array: filtered,
                options: {
                  createdBy: fullName(auth?.fullName),
                  date,
                  frequency,
                  gross:
                    collections.reduce((acc, item) => acc + item?.amount, 0) ||
                    0,
                  earnings: collections
                    .flatMap(({ cart = [] }) => cart) // safe kung walang cart
                    .reduce((acc, item) => {
                      const { fuel, markup = 0, amount = 0, srp = 1 } = item;
                      const baseMarkUp = markup || fuel?.pricing?.markup || 0;
                      const liters = srp > 0 ? amount / srp : 0;
                      return acc + baseMarkUp * liters;
                    }, 0), // <- important!
                  liters:
                    collections.reduce((acc, item) => acc + item?.liters, 0) ||
                    0,
                },
              })
            }
          >
            Export
            <FileText />
          </Button>
        </div>
      </CardAction>
    </CardHeader>
  );
};

export default Header;
