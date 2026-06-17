import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { DESTROY, Set_SELECTED } from "@/services/redux/slices/menu/menus";
import ItemSkeleton from "./item-skeleton";
import EmptyState from "./empty-state";
import Confirmation from "./confirmation";
import MenuItemCard from "./menu-item-card";
import AvailabilityDialog from "./availability-dialog";
import useMenuAvailability from "./use-menu-availability";
import { getRecommendedAddOnEntries } from "./utils";

const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

const Body = () => {
  const { filtered, isLoading, formSubmitted } = useSelector(
    ({ menus }) => menus,
  );
  const { token } = useSelector(({ auth }) => auth);
  const { collections: categories = [] } = useSelector(
    ({ menuCategories }) => menuCategories,
  );

  const dispatch = useDispatch();
  const hasFilteredResults = filtered.length > 0;

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [openDetailId, setOpenDetailId] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("details");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    availabilityDialog,
    availabilitySubmitting,
    availabilityTargetId,
    closeAvailabilityDialog,
    updateAvailability,
    handleAvailabilityToggle,
    getItemAvailability,
  } = useMenuAvailability({ token, dispatch });

  const openItem = useMemo(() => {
    if (!openDetailId) return null;
    return filtered.find((entry) => entry?._id === openDetailId) || null;
  }, [filtered, openDetailId]);

  const openItemHasRecommendedAddOns = useMemo(
    () =>
      getRecommendedAddOnEntries(openItem?.recommendedAddOns || []).length > 0,
    [openItem],
  );

  // If user was viewing add-ons, then removed them (via Manage Add-ons + Save),
  // the tab switcher disappears (because there are no add-ons). Without this,
  // the UI gets stuck showing the "no add-ons" empty state even if recipe/bundle exists.
  useEffect(() => {
    if (!openDetailId) return;

    if (!openItem) {
      setOpenDetailId(null);
      setActiveDetailTab("details");
      return;
    }

    if (activeDetailTab === "addons" && !openItemHasRecommendedAddOns) {
      setActiveDetailTab("details");
    }
  }, [openDetailId, openItem, openItemHasRecommendedAddOns, activeDetailTab]);

  const setDeleteDialogOpen = (value) => {
    setShowDeleteAlert(value);

    if (!value) {
      setDeleteTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      await dispatch(DESTROY({ token, data: { _id: deleteTarget._id } })).unwrap();
      toast.success(`Deleted ${deleteTarget.name} successfully.`);
      setShowDeleteAlert(false);
      setDeleteTarget(null);
      setActiveMenuId(null);
      setOpenDetailId((current) => (current === deleteTarget._id ? null : current));
    } catch (error) {
      toast.error(error?.message || error || "Failed to delete menu item.");
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {skeletonItems.map((item) => (
            <ItemSkeleton key={item} />
          ))}
        </div>
      ) : hasFilteredResults ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const isCashierVisible = getItemAvailability(item);
            const isAvailabilityBusy =
              formSubmitted ||
              (availabilitySubmitting && availabilityTargetId === item?._id);

            return (
              <MenuItemCard
                key={item?._id}
                item={item}
                categories={categories}
                openDetailId={openDetailId}
                setOpenDetailId={setOpenDetailId}
                activeDetailTab={activeDetailTab}
                setActiveDetailTab={setActiveDetailTab}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                isAvailabilityBusy={isAvailabilityBusy}
                isCashierVisible={isCashierVisible}
                onAvailabilityToggle={handleAvailabilityToggle}
                onEdit={(menuItem) => dispatch(Set_SELECTED(menuItem))}
                onSetup={(menuItem, mode = "setup") =>
                  dispatch(
                    Set_SELECTED({
                      item: menuItem,
                      mode: mode === "addons" ? "addons" : "setup",
                    }),
                  )
                }
                onRequestDelete={(menuItem) => {
                  setDeleteTarget(menuItem);
                  setDeleteDialogOpen(true);
                }}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState />
      )}

      <Confirmation
        isOpen={showDeleteAlert}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        item={deleteTarget}
        formSubmitted={formSubmitted}
      />

      <AvailabilityDialog
        open={availabilityDialog.open}
        variant={availabilityDialog.variant}
        item={availabilityDialog.item}
        categories={categories}
        busy={formSubmitted || availabilitySubmitting}
        onClose={closeAvailabilityDialog}
        onConfirmAvailable={(menuItem) => updateAvailability(menuItem, true)}
        onConfirmUnavailable={(menuItem) => updateAvailability(menuItem, false)}
        onManageSetup={(menuItem) => {
          if (menuItem) {
            dispatch(Set_SELECTED({ item: menuItem, mode: "setup" }));
          }
          closeAvailabilityDialog();
        }}
      />
    </>
  );
};

export default Body;

