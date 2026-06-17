import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

const FooterActions = ({
  submitting = false,
  hasDuplicateName = false,
  showAvailabilityOptions = false,
  submitIntent = null,
  setSubmitIntent = () => {},
  onClose = () => {},
  defaultSubmitLabel = "Save",
}) => {
  return (
    <section className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={submitting}
      >
        Close
      </Button>

      {showAvailabilityOptions ? (
        <>
          <Button
            type="submit"
            variant="outline"
            disabled={submitting || hasDuplicateName}
            data-availability="unavailable"
            onClick={() => setSubmitIntent("unavailable")}
          >
            Save as unavailable
            {submitting && submitIntent === "unavailable" && (
              <Loader className="animate-spin" />
            )}
          </Button>
          <Button
            type="submit"
            disabled={submitting || hasDuplicateName}
            data-availability="available"
            onClick={() => setSubmitIntent("available")}
          >
            Save & make available
            {submitting && submitIntent === "available" && (
              <Loader className="animate-spin" />
            )}
          </Button>
        </>
      ) : (
        <Button type="submit" disabled={submitting || hasDuplicateName}>
          {defaultSubmitLabel}
          {submitting && <Loader className="animate-spin" />}
        </Button>
      )}
    </section>
  );
};

export default FooterActions;

