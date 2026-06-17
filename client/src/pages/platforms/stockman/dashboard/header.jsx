import { Button } from "@/components/ui/button";
import {
  PackageSearch,
  AlertTriangle,
  ClipboardList,
  PackagePlus,
} from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="border-b border-border/70 bg-muted/10 px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border bg-background">
            <PackageSearch className="h-4 w-4 text-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-foreground">
              Overview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              At-a-glance inventory status, deliveries, and expiry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Link to="/platforms/stock-requests/create-request">
              <PackagePlus className="h-4 w-4" />
              Create Stock Request
            </Link>
          </Button>

          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link to="/platforms/orders/order-list">
              <ClipboardList className="h-4 w-4" />
              Orders
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="gap-2 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Link to="/platforms/orders/short-deliveries">
              <AlertTriangle className="h-4 w-4" />
              Short deliveries
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
