import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarClock, PackageCheck, TriangleAlert } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TOGGLE_MOVEMENTS_MODAL } from "@/services/redux/slices/inventory/inventoryItems";
import { BROWSE as BROWSE_STOCK_MOVEMENTS } from "@/services/redux/slices/inventory/stockMovements";

import BatchesModalHeader from "./header";
import BatchesModalBody from "./body";

const StockMovementsModal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { showMovementsModal, selected } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );

  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const selectedId = selected?._id;
  const tracksExpiration = Boolean(selected?.trackExpiration);

  const toggle = () => dispatch(TOGGLE_MOVEMENTS_MODAL());

  useEffect(() => {
    if (showMovementsModal && selectedId && token) {
      dispatch(
        BROWSE_STOCK_MOVEMENTS({
          token,
          params: { inventory: selectedId },
        }),
      );
      setSearch("");
    }
  }, [dispatch, showMovementsModal, selectedId, token]);

  return (
    <Dialog open={showMovementsModal} onOpenChange={toggle}>
      <DialogContent className="border-border bg-card p-5 sm:max-w-5xl">
        <BatchesModalHeader
          selected={selected}
          tracksExpiration={tracksExpiration}
          search={search}
          setSearch={setSearch}
          icons={{
            available: PackageCheck,
            soon: CalendarClock,
            expired: TriangleAlert,
          }}
        />

        <BatchesModalBody />
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementsModal;
