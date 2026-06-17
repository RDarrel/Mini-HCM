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
import PendingRequestsTab from "./tabs/pending";
import ApprovedRequestsTab from "./tabs/approved";
import RejectedRequestsTab from "./tabs/rejected";
import { ClipboardList } from "lucide-react";
import {
  BROWSE,
  RESET,
} from "@/services/redux/slices/procurement/stock-requests";

const MyRequests = () => {
  const { isLoading } = useSelector(({ stockRequests }) => stockRequests);
  const { token } = useSelector(({ auth }) => auth);
  const [tab, setTab] = useState("pending");
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;
    dispatch(BROWSE({ token, params: { status: tab } }));
    return () => dispatch(RESET());
  }, [dispatch, token, tab]);

  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Tabs value={tab} onValueChange={setTab} className="w-full gap-0">
          <Card className="bg-card/60 gap-4 py-0 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader className="relative gap-2 border-b border-border/70 px-5 pb-3 pt-3 sm:px-6 sm:pr-72">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/70 shadow-sm">
                  <ClipboardList className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg">
                    My stock requests
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Track your submitted requests by status.
                  </CardDescription>
                </div>
              </div>

              <TabsList className="h-10 w-fit rounded-full border border-border bg-muted/30 p-1 sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2">
                <TabsTrigger
                  value="pending"
                  disabled={isLoading}
                  className="gap-2 rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  disabled={isLoading}
                  value="approved"
                  className="gap-2 rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Approved
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
                <PendingRequestsTab />
              </TabsContent>
              <TabsContent value="approved" className="mt-0">
                <ApprovedRequestsTab />
              </TabsContent>
              <TabsContent value="rejected" className="mt-0">
                <RejectedRequestsTab />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default memo(MyRequests);
