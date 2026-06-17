import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  BROWSE,
  FILTER_BY_GROUP,
  SEARCH,
  SetCREATE,
} from "@/services/redux/slices/menu/addOns/addOns";

import { BROWSE as BROWSE_INGREDIENTS } from "@/services/redux/slices/inventory/inventoryItems";

const GROUP_FILTERS = [
  { value: "all", label: "All" },
  { value: "extras", label: "Extras" },
  { value: "toppings", label: "Toppings" },
  { value: "sides", label: "Sides" },
  { value: "drinks", label: "Drinks" },
];

const CategoryHeader = () => {
  const { token } = useSelector(({ auth }) => auth);
  const {
    search,
    collections = [],
    isLoading,
    activeGroup,
  } = useSelector(({ addOns }) => addOns);
  const dispatch = useDispatch();
  const groupCounts = GROUP_FILTERS.reduce((accumulator, group) => {
    accumulator[group.value] =
      group.value === "all"
        ? collections?.length
        : collections?.filter((item) => item.group === group.value).length;
    return accumulator;
  }, {});

  useEffect(() => {
    if (token) {
      dispatch(BROWSE({ token }));
      dispatch(BROWSE_INGREDIENTS({ token }));
    }
  }, [dispatch, token]);

  return (
    <CardHeader className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle className="text-2xl text-foreground">Add-Ons</CardTitle>
          <CardDescription>
            Manage optional items that can be added to menu orders.
          </CardDescription>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end lg:max-w-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => dispatch(SEARCH(event.target.value))}
              placeholder="Search add-on..."
              className="pl-9"
              type="search"
            />
          </div>

          <Button onClick={() => dispatch(SetCREATE())}>
            <Plus className="h-4 w-4" />
            New Add-On
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {isLoading
          ? GROUP_FILTERS.map((group) => (
              <Skeleton
                key={group.value}
                className={`h-10 rounded-full ${
                  group.value === "all" ? "w-16" : "w-24"
                }`}
              />
            ))
          : GROUP_FILTERS.map((group) => {
              const isActive = activeGroup === group.value;
              const groupCount = groupCounts[group.value];

              return (
                <button
                  key={group.value}
                  type="button"
                  onClick={() => dispatch(FILTER_BY_GROUP(group.value))}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  <span>{group.label}</span>
                  {groupCount > 0 && (
                    <span
                      className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                        isActive
                          ? "bg-primary-foreground/15 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {groupCount}
                    </span>
                  )}
                </button>
              );
            })}
      </div>
    </CardHeader>
  );
};

export default CategoryHeader;
