import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import InventoryBody from "./body";
import InventoryHeader from "./header";
import InventoryModal from "./modal";
import InventoryBatchesModal from "./batchesModal";
import { useDispatch, useSelector } from "react-redux";
import {
  DESTROY,
  SEARCH,
} from "@/services/redux/slices/inventory/inventoryItems";
import { toast } from "sonner";
import StockMovementsModal from "./stockMovements";
import ReportWasteModal from "./reportWaste";
import { useSearchParams } from "react-router-dom";

const Inventory = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { isLoading } = useSelector(({ inventoryItems }) => inventoryItems);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchParams.get("name") && !isLoading) {
      dispatch(SEARCH(searchParams.get("name")));
    }
  }, [searchParams, dispatch, isLoading]);
  const openDeleteModal = (item) => {
    setSelected(item);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selected?._id) return;
    dispatch(DESTROY({ data: { _id: selected._id }, token }))
      .unwrap()
      .then(() => {
        setSelected(null);
        setDeleteOpen(false);
        toast.success("Successfully deleted inventory item.");
      })
      .catch(() => {
        setSelected(null);
        setDeleteOpen(false);
        toast.error("Failed to delete inventory item.");
      });
  };

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="border-border  py-6 shadow-sm">
            <InventoryHeader />

            <InventoryBody
              deleteOpen={deleteOpen}
              setDeleteOpen={setDeleteOpen}
              selected={selected}
              onRequestDelete={openDeleteModal}
              onConfirmDelete={handleDelete}
            />
          </Card>
        </div>
      </div>

      <InventoryModal />
      <InventoryBatchesModal />
      <StockMovementsModal />
      <ReportWasteModal />
    </>
  );
};

export default Inventory;
