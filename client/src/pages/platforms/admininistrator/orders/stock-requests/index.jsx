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
import { ClipboardList, Search } from "lucide-react";
import PendingStockRequestsTab from "./tabs/pending";
import RejectedStockRequestsTab from "./tabs/rejected";
import {
  BROWSE,
  RESET,
  SEARCH as SEARCH_STOCK_REQUESTS,
} from "@/services/redux/slices/procurement/stock-requests";
import { BROWSE as BROWSE_INVENTORY_ITEMS } from "@/services/redux/slices/inventory/inventoryItems";
import { BROWSE as BROWSE_SUPPLIERS } from "@/services/redux/slices/procurement/suppliers";

const StockRequests = () => {
  const { isLoading } = useSelector(({ stockRequests }) => stockRequests);
  const { token } = useSelector(({ auth }) => auth);
  const [tab, setTab] = useState("pending");
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE({ token, params: { status: tab.toLowerCase() } }));
    return () => dispatch(RESET());
  }, [dispatch, token, tab]);

  useEffect(() => {
    if (!token) return;
    dispatch(BROWSE_INVENTORY_ITEMS({ token }));
    dispatch(BROWSE_SUPPLIERS({ token }));
  }, [dispatch, token]);

  useEffect(() => {
    dispatch(SEARCH_STOCK_REQUESTS(query));
  }, [query, dispatch]);

  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Tabs value={tab} onValueChange={setTab} className="w-full gap-0">
          <Card className="bg-card/60 gap-4 py-0 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader className="relative gap-3 border-b border-border/70 px-5 pb-4 pt-4 sm:px-6 sm:pr-[26rem]">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/70 shadow-sm">
                  <ClipboardList className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg">Stock requests</CardTitle>
                  <CardDescription className="text-sm">
                    Review and track stock requests from the stockman.
                  </CardDescription>
                </div>
              </div>

              <div className="relative w-full sm:absolute sm:right-6 sm:top-1/2 sm:w-96 sm:-translate-y-1/2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search stockman..."
                  className="h-10 bg-background/60 pl-9"
                  type="search"
                />
              </div>

              <TabsList className="h-10 w-fit rounded-full border border-border bg-muted/30 p-1">
                <TabsTrigger
                  value="pending"
                  disabled={isLoading}
                  className="gap-2 rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  disabled={isLoading}
                  value="rejected"
                  className="gap-2 rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="px-5 pb-5 sm:px-6">
              <TabsContent value="pending" className="mt-0">
                <PendingStockRequestsTab />
              </TabsContent>
              <TabsContent value="rejected" className="mt-0">
                <RejectedStockRequestsTab />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default memo(StockRequests);
