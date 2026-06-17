import { Checkbox } from "@/components/ui/checkbox";
import { CardContent } from "@/components/ui/card";
import TableLoading from "@/components/shared/loading/table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CartAdd } from "@/services/redux/slices/procurement/stock-requests";
import { Stock, globalSearch } from "@/services/utilities";
import { capitalize, isEmpty } from "lodash";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

const RequestStockBody = ({
  search = "",
  type = "all",
  category = "all",
  stockLevel = "all",
}) => {
  const dispatch = useDispatch();
  const { collections = [], isLoading } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { cart } = useSelector(({ stockRequests }) => stockRequests);

  const filtered = useMemo(() => {
    const safeCollections = Array.isArray(collections) ? collections : [];
    const byType =
      type && type !== "all"
        ? safeCollections.filter((item) => String(item?.type || "") === type)
        : safeCollections;

    const byCategory =
      category && category !== "all"
        ? byType.filter((item) => String(item?.category || "") === category)
        : byType;

    const byStockLevel =
      stockLevel && stockLevel !== "all"
        ? byCategory.filter((item) => {
            const status = String(item?.stockStatus || "")
              .trim()
              .toLowerCase();
            return status === String(stockLevel).trim().toLowerCase();
          })
        : byCategory;

    const keyword = String(search || "").trim();
    if (!keyword) return byStockLevel;
    return globalSearch(byStockLevel, keyword.toUpperCase());
  }, [collections, search, type, category, stockLevel]);

  const sortedFiltered = useMemo(() => {
    const rank = {
      "out of stock": 0,
      "low stock": 1,
      "in stock": 2,
    };

    return (filtered || [])
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const aKey = String(a?.item?.stockStatus || "")
          .trim()
          .toLowerCase();
        const bKey = String(b?.item?.stockStatus || "")
          .trim()
          .toLowerCase();
        const aRank = rank[aKey] ?? 99;
        const bRank = rank[bKey] ?? 99;

        if (aRank !== bRank) return aRank - bRank;
        return a.index - b.index;
      })
      .map(({ item }) => item);
  }, [filtered]);

  const addToCart = (inventory) => {
    dispatch(CartAdd(inventory));
  };

  return (
    <CardContent className="space-y-4 pt-0">
      {!isLoading ? (
        <>
          <div className="overflow-hidden rounded-[7px] border border-border bg-card">
            <Table>
              <TableHeader className="bg-muted/70">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Available Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isEmpty(sortedFiltered) ? (
                  sortedFiltered.map((item) => {
                    const id = String(item?._id || "");
                    const inCart = cart.some(
                      ({ inventory }) => String(inventory?._id) === id,
                    );

                    return (
                      <TableRow
                        key={id}
                        className={`cursor-pointer transition-colors hover:bg-muted/40 ${inCart ? "bg-accent/10" : ""}`}
                        tabIndex={0}
                        onClick={() => addToCart(item)}
                        onKeyDown={(event) => {
                          if (!id) return;
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            addToCart(item);
                          }
                        }}
                      >
                        <TableCell className="whitespace-normal">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={inCart}
                              onCheckedChange={() => {
                                addToCart(item);
                              }}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`Select ${item?.name || "item"}`}
                              className="mt-1"
                            />

                            <div className="space-y-1">
                              <p className="font-semibold text-foreground">
                                {capitalize(item?.name || "")}
                              </p>
                              <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                                {item?.description ||
                                  "No description provided."}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {Stock.display(
                            item?.stockDisplay.current,
                            item?.measurement,
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="py-14 text-center">
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-foreground">
                          No inventory items found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try a different keyword or filter.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <TableLoading numberOfColumns={2} />
      )}
    </CardContent>
  );
};

export default RequestStockBody;
