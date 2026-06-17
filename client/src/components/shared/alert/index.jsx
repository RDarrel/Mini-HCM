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

export function CustomAlert({
  isOpen,
  capture, // performing of function
  setIsOpen,
  showCancelButton = false,
  formSubmitted = false,
  className = "",
  message = "",
  buttonClassName = "",
  buttonTitle = "OK",
  index = 1, // THIS IS FOR DELETE OR UPDATE
}) {
  const haveIndex = index > -1;
  return (
    <AlertDialog open={isOpen} onOpenChange={haveIndex ? () => {} : capture}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <TriangleAlert className="mr-2" color="orange" /> Warning
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={"mt-2"}>
          {showCancelButton && (
            <AlertDialogCancel onClickCapture={() => setIsOpen(false)}>
              Cancel
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClickCapture={() => {
              if (haveIndex) {
                capture(index);
              } else {
                capture(false);
              }
            }}
            className={buttonClassName}
            disabled={formSubmitted}
          >
            {buttonTitle}
            {formSubmitted && <Loader className=" animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
