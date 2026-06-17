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
import { SetFILTERED, SetCHOSEN_ROLES } from "@/services/redux/slices/audit";
import { capitalize } from "lodash";
const Cashiers = () => {
  const { isLoading, collections, chosenRoles } = useSelector(
      ({ audit }) => audit
    ),
    [roles, setRoles] = useState([]),
    [selectedRoles, setSelectedRoles] = useState([]),
    dispatch = useDispatch();

  useEffect(() => {
    if (!collections) return;

    const roles = collections.reduce((acc, curr) => {
      const isExist = acc.some((acc) => acc === curr.role);
      if (!isExist) {
        acc.push(curr.role);
      }
      return acc;
    }, []);
    dispatch(SetCHOSEN_ROLES(roles));
    setRoles(roles);
  }, [collections, dispatch]);

  useEffect(() => {
    const transactions = collections.filter(({ role }) =>
      chosenRoles.includes(role)
    );
    dispatch(SetFILTERED(transactions));
  }, [chosenRoles, collections, dispatch]);

  return (
    <>
      {!isLoading ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Roles <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {roles.map((role, index) => {
              return (
                <DropdownMenuCheckboxItem
                  key={index}
                  className="capitalize"
                  checked={chosenRoles.includes(role)}
                  onCheckedChange={() => {
                    const ids = [...chosenRoles];
                    const index = chosenRoles.indexOf(role);
                    if (index > -1) {
                      ids.splice(index, 1);
                    } else {
                      ids.push(role);
                    }
                    dispatch(SetCHOSEN_ROLES(ids));
                  }}
                >
                  {capitalize(role)}
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
