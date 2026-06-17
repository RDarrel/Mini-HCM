import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { SAVE, TOGGLE, UPDATE } from "@/services/redux/slices/menu/categories";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";

const INITIAL_FORM = {
  name: "",
  description: "",
};

const normalizeName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const getExistingCategory = (collections = [], name = "", selectedId) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return null;
  }

  return collections.find(
    (item) =>
      normalizeName(item.name) === normalizedName && item._id !== selectedId,
  );
};

const NameWarning = ({ name = "", selectedId, collections = [] }) => {
  const existingItem = getExistingCategory(collections, name, selectedId);

  if (!existingItem) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        "{name.trim()}" already exists. Please use a different category name.
      </p>
    </div>
  );
};

const FormField = ({ label, content, error = "" }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {content}
    {error ? <p className="text-xs text-destructive">{error}</p> : null}
  </div>
);

const InventoryModal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { showModal, willCreate, formSubmitted, selected, collections } =
    useSelector(({ menuCategories }) => menuCategories);

  const [form, setForm] = useState(INITIAL_FORM);
  const dispatch = useDispatch();

  const toggle = () => dispatch(TOGGLE());

  useEffect(() => {
    if (showModal) {
      if (!willCreate && selected) {
        setForm({
          ...INITIAL_FORM,
          ...selected,
          cost: selected?.cost ?? "",
        });
      } else {
        setForm({ ...INITIAL_FORM });
      }
    }
  }, [willCreate, selected, showModal]);
  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const hasDuplicateName = !!getExistingCategory(
    collections,
    form.name,
    selected?._id,
  );

  const handleSave = () => {
    dispatch(
      SAVE({
        data: {
          ...form,
          cost: Number(form.cost),
        },
        token,
      }),
    )
      .unwrap()
      .then(() => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success("Successfully saved category.");
      })
      .catch((error) =>
        toast.error(error?.message || error || "Failed to save category."),
      );
  };

  const handleUpdate = () => {
    dispatch(
      UPDATE({
        data: {
          ...form,
          cost: Number(form.cost),
        },
        token,
      }),
    )
      .unwrap()
      .then(() => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success("Successfully updated category.");
      })
      .catch((error) =>
        toast.error(error?.message || error || "Failed to update category."),
      );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (hasDuplicateName) {
      toast.error("This category name already exists.");
      return;
    }

    if (willCreate) {
      handleSave();
    } else {
      handleUpdate();
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-card sm:max-w-1xl">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-2xl text-foreground">
            {willCreate ? "Create" : "Update"} Category
          </DialogTitle>
          <DialogDescription>
            Set up the category details that will be used for your menu items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-2 md:grid-cols-12">
            <div className="md:col-span-12">
              <FormField
                label="Name"
                content={
                  <>
                    <Input
                      required
                      value={form.name}
                      onChange={(event) =>
                        handleChange("name", event.target.value)
                      }
                      placeholder="Enter category name"
                    />
                    <NameWarning
                      name={form.name}
                      selectedId={selected?._id}
                      collections={collections}
                    />
                  </>
                }
              />
            </div>

            <div className="md:col-span-12">
              <FormField
                label="Description"
                content={
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      handleChange("description", event.target.value)
                    }
                    placeholder="Add category description or internal notes"
                    rows={5}
                  />
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={toggle}>
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitted || hasDuplicateName}>
              {willCreate ? "Save" : "Update"}
              <Spinner formSubmitted={formSubmitted} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
