import React, { useEffect, useState } from "react";
import "./print.css";
import { format, capitalize } from "@/services/utilities";

const safeParseJson = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeOrderPrintout = (raw) => {
  const data = raw?.payload ? raw.payload : raw;
  if (!data || typeof data !== "object") return null;

  const createdAt =
    data?.created?.at ?? data?.createdAt ?? data?.updatedAt ?? Date.now();

  const cashierRaw =
    data?.created?.by?.fullName ||
    data?.createdBy?.fullName ||
    data?.cashier?.fullName ||
    "";

  const cashierName =
    typeof cashierRaw === "string"
      ? cashierRaw
      : cashierRaw && typeof cashierRaw === "object"
        ? [cashierRaw?.fname, cashierRaw?.mname, cashierRaw?.lname]
            .filter(Boolean)
            .join(" ")
        : "";

  const itemsRaw = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.cart)
      ? data.cart
      : [];

  const items = itemsRaw
    .map((item) => {
      const menuName = item?.menu?.name || item?.name || "—";
      const quantity = Number(item?.quantity ?? item?.line?.quantity ?? 0) || 0;
      const amount = Number(item?.amount ?? item?.lineTotal ?? 0) || 0;
      const price = Number(item?.price ?? item?.menu?.price ?? 0) || 0;

      const addOns = Array.isArray(item?.breakdown?.addOns)
        ? item.breakdown.addOns
        : Array.isArray(item?.line?.addOns)
          ? item.line.addOns
          : [];

      const bundleItems = Array.isArray(item?.breakdown?.bundleItems)
        ? item.breakdown.bundleItems
        : Array.isArray(item?.menu?.bundleItems)
          ? item.menu.bundleItems
          : [];

      return {
        _id: String(item?._id || item?.id || ""),
        menuName: String(menuName),
        quantity,
        amount: amount || price * quantity,
        addOns,
        bundleItems,
      };
    })
    .filter((item) => item.quantity > 0 || item.amount > 0);

  const totalAmount = Number(data?.amount ?? data?.totalAmount ?? 0) || 0;
  const cash = Number(data?.cash ?? data?.tendered ?? 0) || 0;

  return {
    _id: String(data?._id || ""),
    createdAt,
    cashierName: String(cashierName || ""),
    totalAmount,
    cash,
    items,
  };
};

const OrderReceipt = () => {
  const [sale, setSale] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("order-printout");
    const parsed = safeParseJson(raw);
    setSale(normalizeOrderPrintout(parsed));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      window.close();
    }, 90);

    return () => clearTimeout(timer);
  }, []);

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
    <div className="container-receipt mt-1">
      <div className="header">
        <h6 className="store">Sandy's Kitchenette</h6>
        <h6 className="address">Brgy. Rio Chico Gen. Tinio, Nueva Ecija</h6>
      </div>
      <small className="font-bold text-center block">
        {createdAt ? new Date(createdAt).toDateString() : ""}
        {createdAt ? ", " : ""}
        {createdAt ? new Date(createdAt).toLocaleTimeString() : ""}
      </small>
      <div
        className="text-center"
        style={{
          border: "1px dashed #000",
          borderRadius: "5px",
          padding: "2px",
          position: "relative",
          marginTop: "7.5px",
        }}
      >
        <small
          style={{
            position: "absolute",
            fontWeight: 600,
            top: "-7px",
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

      <div className="receipt-table mt-1">
        <div className="space-y-1 text-[10px] leading-4">
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
                      <div className="relative mt-0.5 pl-5 text-[10px] leading-4 text-black/80">
                        <span
                          aria-hidden="true"
                          className="absolute left-1 top-[-6px] bottom-[0.5rem] w-px bg-black/30"
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
                      <div className="relative mt-0.5 pl-5 text-[10px] leading-4 text-black/80">
                        <span
                          aria-hidden="true"
                          className="absolute left-1 top-[-6px] bottom-[0.5rem] w-px bg-black/30"
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

        <div className="totals-printout">
          <span>VATable Sales:</span>
          <span>{format.peso(vatableSales)}</span>
        </div>
        <div className="totals-printout">
          <span>VAT (12%):</span>
          <span>{format.peso(vat)}</span>
        </div>

        <div className="totals-printout">
          <span>Total:</span>
          <span className="font-weight-bold">{format.peso(totalAmount)}</span>
        </div>

        <div className="footer-receipt">
          <div className="flex justify-between">
            <span className="block">Tendered:</span>
            <span className="block">{format.peso(cash)}</span>
          </div>
          <div className="flex justify-between -mt-1">
            <span>Change:</span>
            <span>{format.peso(change)}</span>
          </div>
        </div>
        <div className="flex justify-between cashier">
          <span>Cashier:</span>
          <span>{cashierName || "—"}</span>
        </div>

        <div className="text-center mt-3">
          <small className="block">THIS SERVES AS YOUR SALES INVOICE</small>
          <small>THANK YOU. ENJOY YOUR FOOD!!</small>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;
