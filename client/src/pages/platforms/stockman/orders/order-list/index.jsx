import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import IncomingOrdersTab from "./tabs/incoming";
import ReceivedOrdersTab from "./tabs/delivered";
import ReceiveOrderModal from "./modal";
import { Search, Truck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  BROWSE,
  RESET,
  SEARCH,
} from "@/services/redux/slices/procurement/purchases";

const tabByStatusParam = {
  incoming: "incoming",
  request: "incoming",
  pending: "incoming",
  received: "received",
  delivered: "received",
};

const validTabs = ["incoming", "received"];

const getTabFromStatusParam = (statusParam) => {
  const status = String(statusParam || "").toLowerCase();
  const tab = tabByStatusParam[status];

  return validTabs.includes(tab) ? tab : "incoming";
};

const getPurchaseParam = (purchaseParam) => {
  if (!purchaseParam) return null;
  return String(purchaseParam);
};

const OrderList = () => {
  const { message, isLoading } = useSelector(({ purchases }) => purchases);
  const { token, auth } = useSelector(({ auth }) => auth);
  const [searchParams] = useSearchParams();

  const initialTab = getTabFromStatusParam(searchParams.get("status"));
  const initialHighlight = getPurchaseParam(searchParams.get("purchase"));

  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [highlightPurchaseId, setHighlightPurchaseId] =
    useState(initialHighlight);
  const dispatch = useDispatch();

  useEffect(() => {
    const nextTab = getTabFromStatusParam(searchParams.get("status"));
    const nextHighlight = getPurchaseParam(searchParams.get("purchase"));

    setTab(nextTab);
    setHighlightPurchaseId(nextHighlight);
  }, [searchParams]);

  useEffect(() => {
    dispatch(
      BROWSE({
        token,
        params: {
          status: tab,
          ...(tab === "received" && { stockman: auth?._id }),
        },
      }),
    );
    return () => dispatch(RESET());
  }, [dispatch, token, tab, auth]);

  useEffect(() => {
    dispatch(SEARCH(query));
  }, [query, dispatch]);

  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Tabs value={tab} onValueChange={setTab} className="w-full gap-0">
          <Card className="bg-card/60 gap-4 py-0 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader className="relative gap-3 border-b border-border/70 px-5 pb-4 pt-4 sm:px-6 sm:pr-[26rem]">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/70 shadow-sm">
                  <Truck className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg">Supplier orders</CardTitle>
                  <CardDescription className="text-sm">
                    Track incoming and received supplier deliveries.
                  </CardDescription>
                </div>
              </div>

              <div className="relative w-full sm:absolute sm:right-6 sm:top-1/2 sm:w-96 sm:-translate-y-1/2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search supplier..."
                  className="h-10 bg-background/60 pl-9"
                  type="search"
                />
              </div>

              {message ? (
                <div className="rounded-xl border border-border bg-destructive/10 px-4 py-3 text-sm text-foreground">
                  <span className="font-medium">
                    Couldn&apos;t load orders.
                  </span>{" "}
                  <span className="text-muted-foreground">{message}</span>
                </div>
              ) : null}

              <TabsList className="h-10 w-fit rounded-full border border-border bg-muted/30 p-1">
                <TabsTrigger
                  value="incoming"
                  disabled={isLoading}
                  className="gap-2 rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Incoming
                </TabsTrigger>
                <TabsTrigger
                  disabled={isLoading}
                  value="received"
                  className="gap-2 rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Received
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="px-5 pb-5  sm:px-6">
              <TabsContent value="incoming" className="mt-0">
                <IncomingOrdersTab highlightPurchaseId={highlightPurchaseId} />
              </TabsContent>
              <TabsContent value="received" className="mt-0">
                <ReceivedOrdersTab />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
        <ReceiveOrderModal />
      </div>
    </div>
  );
};

export default memo(OrderList);
