import { Card } from "@/components/ui/card";
import { useState } from "react";
import Body from "./body";
import Header from "./header";
import Modal from "./modal";
import { useDispatch, useSelector } from "react-redux";
import { DESTROY } from "@/services/redux/slices/menu/addOns/addOns";
import { toast } from "sonner";

const AddOns = () => {
  const { token } = useSelector(({ auth }) => auth);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeGroup, setActiveGroup] = useState("all");
  const dispatch = useDispatch();

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
        toast.success("Successfully deleted add-on.");
      })
      .catch(() => {
        setSelected(null);
        setDeleteOpen(false);
        toast.error("Failed to delete add-on.");
      });
  };

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="border-border py-6 shadow-sm">
            <Header
              activeGroup={activeGroup}
              onChangeGroup={setActiveGroup}
            />
            <Body
              activeGroup={activeGroup}
              deleteOpen={deleteOpen}
              setDeleteOpen={setDeleteOpen}
              selected={selected}
              onRequestDelete={openDeleteModal}
              onConfirmDelete={handleDelete}
            />
          </Card>
        </div>
      </div>

      <Modal />
    </>
  );
};

export default AddOns;
