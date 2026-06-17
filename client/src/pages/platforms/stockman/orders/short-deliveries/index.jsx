import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TriangleAlert } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BROWSE,
  RESET,
  SEARCH as SEARCH_PURCHASES,
} from "@/services/redux/slices/procurement/purchases";
import ReceivedShortDeliveriesTab from "./tabs/received";
import { useSearchParams } from "react-router-dom";
import Incoming from "./tabs/redelivery";
import RedeliveryOrderModal from "./tabs/redelivery/modal";

const statusByTab = {
  pending: "review",
  received: "resolved",
  refunded: "refunded",
  redelivery: "redelivery",
};

const tabByStatusParam = {
  review: "pending",
  resolve: "received",
  resolved: "received",
  received: "received",
  redelivery: "redelivery",
  refunded: "refunded",
};

const validTabs = ["redelivery", "received"];

const getTabFromStatusParam = (statusParam) => {
  const status = String(statusParam || "").toLowerCase();
  const tab = tabByStatusParam[status];

  return validTabs.includes(tab) ? tab : "redelivery";
};

const getPurchaseParam = (purchaseParam) => {
  if (!purchaseParam) return null;
  return String(purchaseParam);
};

const ShortDeliveries = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { isLoading } = useSelector(({ purchases }) => purchases);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const initialTab = useMemo(() => {
    return getTabFromStatusParam(searchParams.get("status"));
  }, []);

  const initialHighlight = useMemo(() => {
    return getPurchaseParam(searchParams.get("purchase"));
  }, []);

  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [highlightPurchaseId, setHighlightPurchaseId] =
    useState(initialHighlight);

  useEffect(() => {
    const nextTab = getTabFromStatusParam(searchParams.get("status"));
    const nextHighlight = getPurchaseParam(searchParams.get("purchase"));

    setTab(nextTab);
    setHighlightPurchaseId(nextHighlight);
  }, [searchParams]);

  useEffect(() => {
    if (!token) return;

    dispatch(
      BROWSE({
        token,
        params: {
          status: statusByTab[tab] || "review",
          isShort: true,
        },
      }),
    );

    return () => dispatch(RESET());
  }, [dispatch, tab, token]);

  useEffect(() => {
    dispatch(SEARCH_PURCHASES(query));
  }, [dispatch, query]);

  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Tabs value={tab} onValueChange={setTab} className="w-full gap-0">
          <Card className="bg-card/60 gap-4 py-0 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader className="relative gap-3 border-b border-border/70 px-5 pb-4 pt-4 sm:px-6 sm:pr-[26rem]">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/70 shadow-sm">
                  <TriangleAlert className="h-4 w-4 text-foreground" />
                </div>

                <div className="min-w-0">
                  <CardTitle className="text-lg">Short deliveries</CardTitle>
                  <CardDescription className="text-sm">
                    Track replacement deliveries and shortage resolutions.
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

              <TabsList className="h-10 w-fit rounded-full border border-border bg-muted/30 p-1">
                <TabsTrigger
                  disabled={isLoading}
                  value="redelivery"
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

            <CardContent className="px-5 pb-5 sm:px-6">
              <TabsContent value="redelivery" className="mt-0">
                <Incoming highlightPurchaseId={highlightPurchaseId} />
              </TabsContent>

              <TabsContent value="received" className="mt-0">
                <ReceivedShortDeliveriesTab
                  highlightPurchaseId={highlightPurchaseId}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        <RedeliveryOrderModal />
      </div>
    </div>
  );
};

export default memo(ShortDeliveries);
