import React, { useEffect, useState } from "react";

import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomCalendar from "./calendar";
import Roles from "./roles";
import Search from "@/components/shared/search";
import { useDispatch, useSelector } from "react-redux";
import { SetFILTERED } from "@/services/redux/slices/audit";
import { globalSearch } from "@/services/utilities";

const Header = () => {
  const { filtered, chosenRoles, collections } = useSelector(
      ({ audit }) => audit
    ),
    [search, setSearch] = useState(""),
    dispatch = useDispatch();

  useEffect(() => {
    if (!search) {
      const reset = collections.filter(({ role }) =>
        chosenRoles.includes(role)
      );
      dispatch(SetFILTERED(reset));
    }
    if (search) {
      const results = globalSearch(filtered, search.toUpperCase());
      dispatch(SetFILTERED(results));
    }
  }, [search, dispatch, collections]);
  return (
    <CardHeader>
      <CardTitle>Audit Trail</CardTitle>

      <CardDescription>
        <div className="flex items-center justify-start gap-3">
          <CustomCalendar />
          <Roles />
        </div>
      </CardDescription>
      <CardAction>
        <Search
          haveAction={false}
          title="..."
          search={search}
          setSearch={setSearch}
        />
      </CardAction>
    </CardHeader>
  );
};

export default Header;
