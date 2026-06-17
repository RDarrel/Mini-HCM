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
import Cloudinary from "@/services/utilities/cloudinary";
import { Loader, TriangleAlert } from "lucide-react";

const Confirmation = ({
  isOpen,
  onOpenChange = () => {},
  onConfirm = () => {},
  item = null,
  formSubmitted = false,
}) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialogContent className="max-w-lg border border-red-100 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
      <AlertDialogHeader className="gap-3">
        <AlertDialogTitle className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <TriangleAlert className="h-5 w-5" />
          </span>
          <span>Delete Menu Item?</span>
        </AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="space-y-5 text-left">
            <div className="rounded-[22px] border border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50 p-3">
              <div className="grid items-center gap-4 md:grid-cols-[160px_1fr]">
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={
                        item?.imgId
                          ? Cloudinary.getMenuImg(item.imgId, item._id)
                          : item?.image
                      }
                      alt={item?.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500">
                      Selected Menu
                    </p>
                    <p className="text-lg font-semibold leading-tight text-foreground">
                      {item?.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                      PHP {item?.price}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    This action will permanently remove this menu item from your
                    current list.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-4 py-3">
              <p className="text-sm leading-6 text-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-red-600">{item?.name}</span>
                ?
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Once deleted, you will need to create it again if you want it
                back.
              </p>
            </div>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter className="mt-4 gap-2">
        <AlertDialogCancel onClick={() => onOpenChange(false)} className="mt-0">
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="gap-2 bg-red-600 hover:bg-red-700"
        >
          Delete Item
          {formSubmitted && <Loader className="animate-spin" />}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default Confirmation;
