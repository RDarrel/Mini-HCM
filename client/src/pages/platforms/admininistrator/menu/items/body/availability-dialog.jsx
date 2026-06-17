import Cloudinary from "@/services/utilities/cloudinary";
import { Formatter } from "@/services/utilities";
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
import { Loader, TriangleAlert } from "lucide-react";
import {
  getAvailabilityDoubleCheckTarget,
  getAvailabilityManageLabel,
  getAvailabilitySetupRequirement,
  getMenuCategoryName,
} from "./utils";

const AvailabilityDialog = ({
  open,
  variant,
  item,
  categories,
  busy,
  onClose,
  onConfirmAvailable,
  onConfirmUnavailable,
  onManageSetup,
}) => {
  const resolvedItem = item || null;

  return (
    <AlertDialog
      open={Boolean(open)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && busy) return;
        if (!nextOpen) onClose?.();
      }}
    >
      <AlertDialogContent
        className="max-w-lg border border-border bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.22)]"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <AlertDialogHeader className="gap-2">
          <AlertDialogTitle className="flex items-center gap-3 text-left">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                variant === "confirmAvailable"
                  ? "bg-emerald-100 text-emerald-700"
                  : variant === "confirmUnavailable"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-orange-100 text-orange-600"
              }`}
            >
              <TriangleAlert className="h-5 w-5" />
            </span>
            <span>
              {variant === "confirmAvailable"
                ? "Make this menu item available?"
                : variant === "confirmUnavailable"
                  ? "Make this menu item unavailable?"
                  : "Not ready to sell yet"}
            </span>
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              <div
                className={`rounded-[22px] border p-3 ${
                  variant === "confirmUnavailable"
                    ? "border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50"
                    : "border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50"
                }`}
              >
                <div className="grid items-center gap-4 md:grid-cols-[140px_1fr]">
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={
                          resolvedItem?.imgId
                            ? Cloudinary.getMenuImg(
                                resolvedItem.imgId,
                                resolvedItem?._id,
                              )
                            : resolvedItem?.image
                        }
                        alt={resolvedItem?.name || "Menu item"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Selected Menu Item
                    </p>
                    <p className="text-lg font-semibold leading-tight text-foreground">
                      {resolvedItem?.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                        {getMenuCategoryName(resolvedItem, categories)}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                        {Formatter.amount(Number(resolvedItem?.price || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl border border-dashed px-4 py-3 ${
                  variant === "confirmAvailable"
                    ? "border-emerald-200 bg-emerald-50/60"
                    : variant === "confirmUnavailable"
                      ? "border-slate-200 bg-slate-50/60"
                      : "border-orange-200 bg-orange-50/60"
                }`}
              >
                <p className="text-sm text-foreground">
                  {variant === "confirmAvailable" ? (
                    <>
                      Before making{" "}
                      <span className="font-semibold">{resolvedItem?.name}</span>{" "}
                      available, please double-check the{" "}
                      <span className="font-semibold">
                        {getAvailabilityDoubleCheckTarget(resolvedItem?.type)}
                      </span>{" "}
                      details.
                    </>
                  ) : variant === "confirmUnavailable" ? (
                    <>
                      Are you sure you want to mark{" "}
                      <span className="font-semibold">{resolvedItem?.name}</span>{" "}
                      as unavailable?
                    </>
                  ) : (
                    <>
                      To make this item available, please{" "}
                      <span className="font-semibold">
                        {getAvailabilitySetupRequirement(resolvedItem?.type)}
                      </span>{" "}
                      first.
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {variant === "confirmAvailable"
                    ? "This helps keep inventory deductions and costing accurate."
                    : variant === "confirmUnavailable"
                      ? "Once unavailable, this item will no longer be available for selling."
                      : "This helps ensure pricing, stock, and costing are accurate."}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel
            onClick={onClose}
            className="mt-0"
            disabled={busy}
          >
            Cancel
          </AlertDialogCancel>

          {variant === "confirmAvailable" ? (
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                onConfirmAvailable?.(resolvedItem);
              }}
              disabled={busy}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              Make available
              {busy && <Loader className="h-4 w-4 animate-spin" />}
            </AlertDialogAction>
          ) : variant === "confirmUnavailable" ? (
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                onConfirmUnavailable?.(resolvedItem);
              }}
              disabled={busy}
              className="gap-2 bg-slate-900 hover:bg-slate-900/90"
            >
              Make unavailable
              {busy && <Loader className="h-4 w-4 animate-spin" />}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={() => onManageSetup?.(resolvedItem)}
              disabled={busy}
              className="bg-primary hover:bg-primary/90"
            >
              {getAvailabilityManageLabel(resolvedItem?.type)}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvailabilityDialog;

