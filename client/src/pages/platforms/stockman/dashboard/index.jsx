import { Card } from "@/components/ui/card";
import { BROWSE as BROWSE_INVENTORY } from "@/services/redux/slices/inventory/inventoryItems";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./header";
import Summary from "./summary";
import Lists from "./lists";

const Dashboard = () => {
  const dispatch = useDispatch();
  const token = useSelector(({ auth }) => auth?.token);

  useEffect(() => {
    if (!token) return;
    dispatch(BROWSE_INVENTORY({ token }));
  }, [dispatch, token]);

  return (
    <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Card className="gap-0 overflow-hidden rounded-2xl border border-border bg-card py-0 shadow-sm">
          <Header />
          <div className="grid gap-2 bg-muted/5 px-4 py-4 sm:px-6 lg:grid-cols-12">
            <Summary />
            <Lists />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
