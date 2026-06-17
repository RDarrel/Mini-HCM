import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch, useSelector } from "react-redux";
import { fullName } from "@/services/utilities";
import { SetFILTERED } from "@/services/redux/slices/commerce/transactions";
const Cashiers = () => {
  const { isLoading, collections } = useSelector(
      ({ transactions }) => transactions
    ),
    [cashiers, setCashiers] = useState([]),
    [selectedIDS, setSelectedIDS] = useState([]),
    dispatch = useDispatch();

  useEffect(() => {
    if (!collections) return;

    const cashiers = collections.reduce((acc, curr) => {
      if (curr.cashier?._id) {
        const isExist = acc.some(({ _id }) => _id === curr.cashier._id);
        if (!isExist) {
          acc.push(curr.cashier);
        }
      }
      return acc;
    }, []);
    setSelectedIDS(cashiers.map(({ _id }) => _id));
    setCashiers(cashiers);
  }, [collections]);

  useEffect(() => {
    const transactions = collections.filter(({ cashier }) =>
      selectedIDS.includes(cashier._id)
    );
    dispatch(SetFILTERED(transactions));
  }, [selectedIDS, collections, dispatch]);
  return (
    <>
      {!isLoading ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Cashiers <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {cashiers.map((cashier, index) => {
              return (
                <DropdownMenuCheckboxItem
                  key={index}
                  className="capitalize"
                  checked={selectedIDS.includes(cashier._id)}
                  onCheckedChange={() => {
                    const ids = [...selectedIDS];
                    const index = selectedIDS.indexOf(cashier._id);
                    if (index > -1) {
                      ids.splice(index, 1);
                    } else {
                      ids.push(cashier._id);
                    }
                    setSelectedIDS(ids);
                  }}
                >
                  {fullName(cashier.fullName)}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Skeleton className="w-25 h-9" />
      )}
    </>
  );
};

export default Cashiers;
