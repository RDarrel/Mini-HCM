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
import { CartAdd } from "@/services/redux/slices/procurement/purchases";
import {
  Formatter,
  Inventory,
  Stock,
  globalSearch,
} from "@/services/utilities";
import { capitalize, isEmpty } from "lodash";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

const CreateOrderBody = ({
  search = "",
  supplierId = "all",
  type = "all",
  category = "all",
}) => {
  const dispatch = useDispatch();
  const { collections = [], isLoading } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { cart } = useSelector(({ purchases }) => purchases);

  const filtered = useMemo(() => {
    const safeCollections = Array.isArray(collections) ? collections : [];
    const bySupplier =
      supplierId && supplierId !== "all"
        ? safeCollections.filter((item) => {
            const directSupplierId = String(item?.supplier?._id || "");
            if (directSupplierId && directSupplierId === supplierId)
              return true;

            const suppliers = Array.isArray(item?.suppliers)
              ? item.suppliers
              : [];
            return suppliers.some(
              (row) => String(row?.supplier?._id || "") === supplierId,
            );
          })
        : safeCollections;

    const byType =
      type && type !== "all"
        ? bySupplier.filter((item) => String(item?.type || "") === type)
        : bySupplier;

    const byCategory =
      category && category !== "all"
        ? byType.filter((item) => String(item?.category || "") === category)
        : byType;

    const keyword = String(search || "").trim();
    if (!keyword) return byCategory;
    return globalSearch(byCategory, keyword.toUpperCase());
  }, [collections, search, supplierId, type, category]);

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
    const preferredSupplierId =
      supplierId && supplierId !== "all" ? supplierId : undefined;

    if (preferredSupplierId) {
      dispatch(CartAdd({ inventory, supplier: preferredSupplierId }));
      return;
    }

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
                  <TableHead>Unit Cost</TableHead>
                  <TableHead className="text-right">Available Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isEmpty(sortedFiltered) ? (
                  sortedFiltered.map((item) => {
                    const id = String(item?._id || "");
                    const inCart = cart.some(
                      ({ inventory }) => String(inventory?._id) === id,
                    );

                    const supplierRows = Array.isArray(item?.suppliers)
                      ? item.suppliers
                      : [];
                    const supplierRow =
                      supplierId && supplierId !== "all"
                        ? supplierRows.find(
                            (row) =>
                              String(row?.supplier?._id || "") === supplierId,
                          ) ||
                          supplierRows
                            .slice()
                            .sort(
                              (a, b) =>
                                Number(Boolean(b?.isPrimary)) -
                                Number(Boolean(a?.isPrimary)),
                            )[0] ||
                          null
                        : supplierRows
                            .slice()
                            .sort(
                              (a, b) =>
                                Number(Boolean(b?.isPrimary)) -
                                Number(Boolean(a?.isPrimary)),
                            )[0] || null;

                    const unitCost =
                      supplierRow?.cost ?? item?.cost ?? item?.price ?? 0;
                    const unitCostSupplierName = String(
                      supplierRow?.supplier?.name || item?.supplier?.name || "",
                    ).trim();
                    const unitLabel =
                      Inventory.getUnitByMeasurement(
                        String(item?.measurement || "").toLowerCase(),
                        true,
                      ) || "";

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
                          <div className="space-y-0.5">
                            <p className="font-medium tabular-nums text-foreground">
                              {Formatter.amount(unitCost)}{" "}
                              <span className="text-xs text-muted-foreground">
                                / {unitLabel || "—"}
                              </span>
                            </p>
                            {!!unitCostSupplierName && (
                              <p className="text-xs font-normal text-muted-foreground">
                                From {unitCostSupplierName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-right text-foreground">
                          <p className="font-medium tabular-nums text-foreground">
                            {Stock.format(item?.stockDisplay.current)}{" "}
                            <span className="text-xs text-muted-foreground">
                              {unitLabel || "—"}
                            </span>
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-14 text-center">
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-foreground">
                          No inventory items found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try a different search term.
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
        <TableLoading numberOfColumns={3} />
      )}
    </CardContent>
  );
};

export default CreateOrderBody;
