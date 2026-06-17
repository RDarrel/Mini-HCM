import React, { useMemo } from "react";
import "./print.css";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format, capitalize } from "@/services/utilities";

const normalizeOrder = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const createdAt =
    raw?.created?.at ?? raw?.createdAt ?? raw?.updatedAt ?? Date.now();

  const cashierRaw = raw?.created?.by?.fullName || "";
  const cashierName =
    typeof cashierRaw === "string"
      ? cashierRaw
      : cashierRaw && typeof cashierRaw === "object"
        ? [cashierRaw?.fname, cashierRaw?.mname, cashierRaw?.lname]
            .filter(Boolean)
            .join(" ")
        : "";

  const itemsRaw = Array.isArray(raw?.items) ? raw.items : [];
  const items = itemsRaw
    .map((item) => {
      const menuName = item?.menu?.name || "—";
      const quantity = Number(item?.quantity ?? 0) || 0;
      const amount = Number(item?.amount ?? 0) || 0;
      const price = Number(item?.price ?? 0) || 0;

      const addOns = Array.isArray(item?.breakdown?.addOns)
        ? item.breakdown.addOns
        : [];

      const bundleItems = Array.isArray(item?.breakdown?.bundleItems)
        ? item.breakdown.bundleItems
        : [];

      return {
        _id: String(item?._id || item?.id || ""),
        menuName: String(menuName || "—"),
        quantity,
        amount: amount || price * quantity,
        addOns,
        bundleItems,
      };
    })
    .filter((item) => item.quantity > 0 || item.amount > 0);

  const totalAmount = Number(raw?.amount ?? 0) || 0;
  const cash = Number(raw?.cash ?? 0) || 0;

  return {
    _id: String(raw?._id || ""),
    createdAt,
    cashierName: String(cashierName || ""),
    totalAmount,
    cash,
    items,
  };
};

const ViewReceiptModal = ({ isOpen, setIsOpen, order }) => {
  const sale = useMemo(() => normalizeOrder(order), [order]);

  const {
    _id,
    items = [],
    totalAmount = 0,
    cash = 0,
    createdAt,
    cashierName,
  } = sale || {};

  const change = cash - totalAmount;
  const vatRate = 0.12;
  const vatableSales = totalAmount / (1 + vatRate);
  const vat = totalAmount - vatableSales;

  return (
    <Dialog open={Boolean(isOpen)} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm rounded-2xl bg-white p-3 text-foreground shadow-xl">
        <div className="vr-container">
          <div className="vr-header">
            <h6 className="vr-store">Sandy&apos;s Kitchenette</h6>
            <h6 className="vr-address">
              Brgy. Rio Chico Gen. Tinio, Nueva Ecija
            </h6>
          </div>

          <small className="font-bold text-center block text-[13px]">
            {createdAt ? new Date(createdAt).toDateString() : ""}
            {createdAt ? ", " : ""}
            {createdAt ? new Date(createdAt).toLocaleTimeString() : ""}
          </small>

          <div
            className="text-center"
            style={{
              border: "1px dashed rgba(0,0,0,0.45)",
              borderRadius: "5px",
              padding: "7px 2px 2px",
              position: "relative",
              marginTop: "7.5px",
            }}
          >
            <small
              style={{
                position: "absolute",
                fontWeight: 600,
                top: "-9px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "white",
                padding: "0 3px",
              }}
            >
              Transaction ID
            </small>
            <span className="block mt-">{_id || "—"}</span>
          </div>

          <div className="vr-receipt-table mt-2">
            <div className="space-y-1 text-[15px] leading-6">
              {items.length ? (
                items.map((item, i) => {
                  const lineKey = item._id || `${item.menuName}-${i}`;
                  const qty = Number(item.quantity) || 0;
                  const lineTotal = Number(item.amount) || 0;

                  const addOns = Array.isArray(item.addOns) ? item.addOns : [];
                  const bundleItems = Array.isArray(item.bundleItems)
                    ? item.bundleItems
                    : [];

                  return (
                    <div key={lineKey} className="space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 break-words">
                          <span className="font-bold tabular-nums">{qty}x</span>{" "}
                          {capitalize(item.menuName)}
                        </p>
                        <p className="shrink-0 font-bold tabular-nums">
                          {format.peso(lineTotal)}
                        </p>
                      </div>

                      {addOns.length ? (
                        <div className="pl-5">
                          <div className="relative mt-0.5 pl-5 text-[14px] leading-6 text-black/80">
                            <span
                              aria-hidden="true"
                              className="absolute left-1 top-[-6px] bottom-4 w-px bg-black/30"
                            />
                            {addOns.map((row, addOnIndex) => {
                              const name = String(
                                row?.addOn?.name || row?.name || "Add-on",
                              );
                              const amount =
                                Number(row?.amount ?? row?.price ?? 0) || 0;
                              return (
                                <div
                                  key={String(
                                    row?._id ||
                                      row?.addOn?._id ||
                                      row?.addOn ||
                                      `${lineKey}-addon-${addOnIndex}`,
                                  )}
                                  className="relative flex items-start justify-between gap-2"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="absolute -left-4 top-2 h-px w-3 bg-black/30"
                                  />
                                  <p className="min-w-0 break-words">
                                    {capitalize(name)}
                                  </p>
                                  <p className="shrink-0 font-semibold tabular-nums text-black/90">
                                    +{format.peso(amount)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      {bundleItems.length ? (
                        <div className="pl-5">
                          <div className="relative mt-0.5 pl-5 text-[14px] leading-6 text-black/80">
                            <span
                              aria-hidden="true"
                              className="absolute left-1 top-[-6px] bottom-4 w-px bg-black/30"
                            />
                            {bundleItems.map((row, bundleIndex) => {
                              const name = String(
                                row?.bundle?.name || row?.name || "Bundle item",
                              );
                              return (
                                <div
                                  key={String(
                                    row?._id ||
                                      row?.bundle?._id ||
                                      row?.bundle ||
                                      `${lineKey}-bundle-${bundleIndex}`,
                                  )}
                                  className="relative flex items-start justify-between gap-2"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="absolute -left-4 top-2 h-px w-3 bg-black/30"
                                  />
                                  <p className="min-w-0 break-words">
                                    {capitalize(name)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="text-center opacity-70">No items</p>
              )}
            </div>

            <div className="vr-totals-printout">
              <span>VATable Sales:</span>
              <span>{format.peso(vatableSales)}</span>
            </div>
            <div className="vr-totals-printout">
              <span>VAT (12%):</span>
              <span>{format.peso(vat)}</span>
            </div>

            <div className="vr-totals-printout">
              <span>Total:</span>
              <span className="font-weight-bold">
                {format.peso(totalAmount)}
              </span>
            </div>

            <div className="vr-footer-receipt">
              <div className="flex justify-between">
                <span className="block">Tendered:</span>
                <span className="block">{format.peso(cash)}</span>
              </div>
              <div className="flex justify-between -mt-1">
                <span>Change:</span>
                <span>{format.peso(change)}</span>
              </div>
            </div>
            <div className="flex justify-between vr-cashier">
              <span>Cashier:</span>
              <span>{cashierName || "—"}</span>
            </div>

            <div className="text-center mt-3">
              <small className="block">THIS SERVES AS YOUR SALES INVOICE</small>
              <small>THANK YOU. ENJOY YOUR FOOD!!</small>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReceiptModal;
