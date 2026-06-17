import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Formatter } from "@/services/utilities";

const PriceWarningDialog = ({
  open = false,
  onOpenChange = () => {},
  declaredPrice = 0,
  estimatedCost = 0,
  pendingPayload = null,
  onCancel = () => {},
  onContinue = async () => {},
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border border-border bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
        <AlertDialogHeader>
          <AlertDialogTitle>Review menu price</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                The price you entered may leave little to no profit on this menu
                item.
              </p>

              <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Declared Price
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {Formatter.amount(Number(declaredPrice || 0))}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Estimated Cost
                  </span>
                  <span className="text-base font-semibold text-destructive">
                    {Formatter.amount(Number(estimatedCost || 0))}
                  </span>
                </div>
              </div>

              <p>
                Since your selling price is not higher than the estimated cost,
                this item could earn very little or even lose money. Do you
                still want to continue?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (!pendingPayload) return;
              await onContinue(pendingPayload);
            }}
          >
            Continue Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PriceWarningDialog;

