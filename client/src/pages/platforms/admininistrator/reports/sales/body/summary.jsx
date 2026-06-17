import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
const Summary = () => {
  const { isLoading, collections = [] } = useSelector(({ deals }) => deals);
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        {
          color: "C7BD00",
          text: "Gross",
          total: collections.reduce((acc, item) => acc + item?.amount, 0) || 0,
        },
        {
          color: "008000",
          text: "Earnings",
          total: collections
            .flatMap(({ cart = [] }) => cart) // safe kung walang cart
            .reduce((acc, item) => {
              const { fuel, markup = 0, amount = 0, srp = 1 } = item;
              const baseMarkUp = markup || fuel?.pricing?.markup || 0;
              const liters = srp > 0 ? amount / srp : 0;
              return acc + baseMarkUp * liters;
            }, 0), // <- important!
        },
        {
          color: "FF0000",
          text: "Liters",
          isLiters: true,
          total: collections.reduce((acc, item) => acc + item?.liters, 0) || 0,
        },
      ].map(({ color, text, total = 0, isLiters = false }, idx) => {
        return (
          <Card className="p-2 shadow-sm" key={`${idx}`}>
            <CardContent className="m-0 p-0">
              {!isLoading ? (
                <h2 style={{ color: `#${color}` }} className={`font-[700]`}>
                  {text}
                </h2>
              ) : (
                <Skeleton className="h-6 w-[7rem] bg-gray-200" />
              )}
              <div className="-mt-2">
                {!isLoading ? (
                  <>
                    {!isLiters ? (
                      <h2 className="text-end digital-texts text-2xl text-gray-800">
                        P
                        {Number(total).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </h2>
                    ) : (
                      <h2 className="text-end digital-texts text-2xl text-gray-800">
                        {Number.isInteger(total) ? total : total.toFixed(2)} L
                      </h2>
                    )}
                  </>
                ) : (
                  <div className="flex justify-end mt-3">
                    <Skeleton className="h-6 w-[7rem] bg-gray-200" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Summary;
