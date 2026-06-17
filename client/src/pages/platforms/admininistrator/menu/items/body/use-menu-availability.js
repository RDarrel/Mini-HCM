import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  SET_AVAILABILITY,
  SetUPDATED_MENU,
} from "@/services/redux/slices/menu/menus";

const getIsAvailable = (menuItem) =>
  Boolean(menuItem?.isAvailable ?? menuItem?.isPublish);

export default function useMenuAvailability({ token, dispatch }) {
  const [availabilityOverrides, setAvailabilityOverrides] = useState({});
  const [availabilityDialog, setAvailabilityDialog] = useState({
    open: false,
    variant: null,
    item: null,
  });
  const [availabilitySubmitting, setAvailabilitySubmitting] = useState(false);
  const [availabilityTargetId, setAvailabilityTargetId] = useState(null);

  const closeAvailabilityDialog = useCallback(() => {
    setAvailabilityDialog({ open: false, variant: null, item: null });
    setAvailabilityTargetId(null);
  }, []);

  const openAvailabilityDialog = useCallback((variant, item) => {
    setAvailabilityDialog({ open: true, variant, item });
    setAvailabilityTargetId(item?._id || null);
  }, []);

  const updateAvailability = useCallback(
    async (menuItem, nextAvailability) => {
      if (!menuItem?._id) return;

      setAvailabilitySubmitting(true);
      setAvailabilityTargetId(menuItem._id);
      setAvailabilityOverrides((current) => ({
        ...current,
        [menuItem._id]: nextAvailability,
      }));

      try {
        const { payload: updatedPayload } = await dispatch(
          SET_AVAILABILITY({
            token,
            data: { _id: menuItem._id, isAvailable: nextAvailability },
          }),
        ).unwrap();

        dispatch(SetUPDATED_MENU(updatedPayload));
        setAvailabilityOverrides((current) => {
          const next = { ...current };
          delete next[menuItem._id];
          return next;
        });

        toast.success(
          updatedPayload?.isAvailable
            ? "Menu item is now available."
            : "Menu item is now unavailable.",
        );

        closeAvailabilityDialog();
      } catch (error) {
        setAvailabilityOverrides((current) => {
          const next = { ...current };
          delete next[menuItem._id];
          return next;
        });
        toast.error(error?.message || error || "Failed to update availability.");
      } finally {
        setAvailabilitySubmitting(false);
      }
    },
    [closeAvailabilityDialog, dispatch, token],
  );

  const handleAvailabilityToggle = useCallback(
    (menuItem, currentAvailability, hasSetup) => {
      if (availabilitySubmitting && availabilityTargetId === menuItem?._id) {
        return;
      }

      if (currentAvailability) {
        openAvailabilityDialog("confirmUnavailable", menuItem);
        return;
      }

      if (!hasSetup) {
        openAvailabilityDialog("setupRequired", menuItem);
        return;
      }

      openAvailabilityDialog("confirmAvailable", menuItem);
    },
    [availabilitySubmitting, availabilityTargetId, openAvailabilityDialog],
  );

  const getItemAvailability = useCallback(
    (item) => {
      const isOptimisticRow =
        availabilitySubmitting && availabilityTargetId === item?._id;

      if (isOptimisticRow) {
        return Boolean(availabilityOverrides[item._id]);
      }

      return getIsAvailable(item);
    },
    [availabilityOverrides, availabilitySubmitting, availabilityTargetId],
  );

  return {
    availabilityDialog,
    availabilitySubmitting,
    availabilityTargetId,
    availabilityOverrides,
    closeAvailabilityDialog,
    openAvailabilityDialog,
    updateAvailability,
    handleAvailabilityToggle,
    getItemAvailability,
  };
}

