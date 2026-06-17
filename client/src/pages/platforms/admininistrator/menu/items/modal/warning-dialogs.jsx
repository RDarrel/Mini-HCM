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
import { Loader } from "lucide-react";

export const SaveUnavailableNoticeDialog = ({
  open = false,
  onOpenChange = () => {},
  submitting = false,
  requirementLabel = "",
  pendingPayload = null,
  onSubmit = async () => {},
  onClear = () => {},
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border border-border bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
        <AlertDialogHeader>
          <AlertDialogTitle>Saved as unavailable</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                This menu item will be saved, but it won&apos;t be available for
                selling yet.
              </p>
              <p>
                To make it available later, open the details and{" "}
                {requirementLabel}.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting} onClick={onClear}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={async () => {
              if (!pendingPayload) return;
              await onSubmit(pendingPayload);
              onClear();
            }}
          >
            Save as unavailable
            {submitting && <Loader className="animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const RemoveSetupConfirmDialog = ({
  open = false,
  onOpenChange = () => {},
  submitting = false,
  copy = { title: "", lead: "", detail: "" },
  pendingPayload = null,
  onSubmit = async () => {},
  onClear = () => {},
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border border-border bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="text-foreground">{copy.lead}</p>
              <p>{copy.detail}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting} onClick={onClear}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={async () => {
              if (!pendingPayload) return;
              await onSubmit(pendingPayload);
              onClear();
            }}
          >
            Proceed & save as unavailable
            {submitting && <Loader className="animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

