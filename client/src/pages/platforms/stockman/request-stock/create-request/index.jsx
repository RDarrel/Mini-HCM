import { BROWSE } from "@/services/redux/slices/inventory/inventoryItems";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RequestStockBody from "./body";
import RequestStockHeader from "./header";
import RequestStockCart from "./cart";
import { ArrowRight } from "lucide-react";
import ReviewStockRequestModal from "./review-modal";

const RequestStock = () => {
  const { token } = useSelector(({ auth }) => auth),
    [search, setSearch] = useState(""),
    [type, setType] = useState("all"),
    [category, setCategory] = useState("all"),
    [stockLevel, setStockLevel] = useState("all"),
    dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(BROWSE({ token }));
    }
  }, [dispatch, token]);

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:gap-x-3 lg:grid-cols-[1fr_40px_380px] lg:items-start">
            <Card className="border-border py-6 shadow-sm">
              <RequestStockHeader
                search={search}
                setSearch={setSearch}
                type={type}
                setType={setType}
                category={category}
                setCategory={setCategory}
                stockLevel={stockLevel}
                setStockLevel={setStockLevel}
              />
              <RequestStockBody
                search={search}
                type={type}
                category={category}
                stockLevel={stockLevel}
              />
            </Card>

            <div className="hidden lg:block lg:sticky lg:top-6 h-[calc(100dvh-6.25rem)]">
              <div className="flex h-full items-center justify-center pointer-events-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <Card className="border-border shadow-sm hidden lg:flex lg:flex-col lg:sticky lg:top-6 h-[calc(100dvh-6.25rem)] overflow-hidden gap-4">
              <RequestStockCart />
            </Card>
          </div>

          <div className="mt-6 lg:hidden">
            <Card className="border-border shadow-sm gap-4">
              <RequestStockCart />
            </Card>
          </div>
        </div>
      </div>

      <ReviewStockRequestModal />
    </>
  );
};

export default RequestStock;
