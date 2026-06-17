import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
const FuelBreakdown = () => {
  const { filtered, isLoading } = useSelector(
    ({ transactions }) => transactions
  );
  const [deletedSales, setDeletedSales] = useState([]);

  const [fuels, setFuels] = useState([]);

  useEffect(() => {
    const existing = filtered.filter(({ deletedAt = "" }) => !deletedAt);
    const deleted = filtered.filter(({ deletedAt }) => deletedAt);
    const cart = existing.flatMap((deal) => deal.cart);
    const cluster = cart.reduce((acc, ct) => {
      const { amount, srp, fuel } = ct;

      const index = acc.findIndex((item) => item?.fuel?._id === fuel?._id);
      if (index !== -1) {
        acc[index].liters += amount / srp;
        acc[index].total += amount;
      } else {
        acc.push({ fuel, liters: amount / srp, total: amount });
      }
      return acc;
    }, []);

    setFuels(cluster);
    setDeletedSales(deleted);
  }, [filtered]);

  const getFuel = (fuel) => {
    return fuels.find((item) => item?.fuel?._id === fuel);
  };

  const getTotal = () => {
    const total = fuels.reduce((acc, item) => acc + item.total, 0);
    const liters = fuels.reduce((acc, item) => acc + item.liters, 0);

    return { liters, total };
  };

  const { liters = 0, total = 0 } = getTotal();

  return (
    <Card className="col-span-1 p-0">
      <CardContent className="grid grid-cols-1 gap-2">
        {/* Header */}
        <div className="mt-2 flex items-center justify-between">
          <h2 className="font-bold text-xl">Fuel Breakdown</h2>
        </div>

        {[
          { _id: "682378e40a661261ac790755", color: "FF0000", text: "Premium" },
          {
            _id: "6823797e0a661261ac790756",
            color: "008000",
            text: "Unleaded",
          },
          {
            _id: "6823798f0a661261ac790757",
            color: "C7BD00",
            text: "Diesel",
          },
        ].map(({ _id, color, text, mb }) => {
          const { liters = 0, total = 0 } = getFuel(_id) || {};
          return (
            <Card className={`p-2 shadow-sm ${mb}`} key={_id}>
              <CardContent className="m-0 p-0">
                {!isLoading ? (
                  <h2 className={`font-[700] `} style={{ color: `#${color}` }}>
                    {text}
                  </h2>
                ) : (
                  <Skeleton className="h-6 w-[7rem] bg-gray-200" />
                )}
                <div className="-mt-2">
                  {!isLoading ? (
                    <h2 className="text-end digital-texts text-2xl text-gray-800">
                      P
                      {Number(total).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h2>
                  ) : (
                    <div className="flex justify-end mt-3">
                      <Skeleton className="h-6 w-[7rem] bg-gray-200" />
                    </div>
                  )}
                  {!isLoading ? (
                    <h2 className="text-end digital-texts text-xl text-gray-600">
                      {Number.isInteger(liters) ? liters : liters.toFixed(2)} L
                    </h2>
                  ) : (
                    <div className="flex justify-end mt-2">
                      <Skeleton className="h-5 w-[5rem] bg-gray-200" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Total Section */}
        <Card className="p-3  mb-3 bg-[#FFF5F0] border-t-4 border-[#FF4F00] shadow-md">
          <CardContent className="m-0 p-0">
            <div className="flex items-center justify-between">
              {!isLoading ? (
                <h2 className="font-bold text-lg text-[#FF4F00] tracking-wide">
                  TOTAL
                </h2>
              ) : (
                <Skeleton className="h-7 w-[5rem] bg-gray-200" />
              )}
              <div className="text-end">
                <h2 className="digital-texts text-3xl font-extrabold text-[#FF4F00]">
                  {!isLoading ? (
                    <>
                      P
                      {Number(total).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </>
                  ) : (
                    <Skeleton className="h-7 w-[6rem] bg-gray-200" />
                  )}
                </h2>
                <h2 className="digital-texts text-xl font-semibold text-gray-700">
                  {!isLoading ? (
                    <>
                      {Number.isInteger(liters) ? liters : liters.toFixed(2)} L
                    </>
                  ) : (
                    <div className="flex justify-end">
                      <Skeleton className="h-5 w-[5rem] mt-3 bg-gray-200" />
                    </div>
                  )}
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>

        {deletedSales.length > 0 && !isLoading && (
          <>
            <hr className="my-2 border-t-2 border-gray-300" />

            <Card className="p-3 mb-3 bg-[#F8F8F8] border-t-4 border-red-600 shadow-md mt-2">
              <CardContent className="m-0 p-0">
                <div>
                  <h2 className="font-bold  text-red-600 tracking-wide">
                    DELETED TRANSACTIONS
                  </h2>
                  <div className="text-end">
                    <h2 className="digital-texts text-3xl font-extrabold text-red-600">
                      P
                      {Number(
                        deletedSales.reduce(
                          (acc, { amount = 0 }) => (acc += amount),
                          0
                        )
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h2>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FuelBreakdown;
