import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader } from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SAVE, UPDATE } from "@/services/redux/slices/procurement/suppliers";
const _form = {
  name: "",
  contact: {
    person: "",
    mobile: "",
  },
  address: "",
};
const CustomModal = ({
  isOpen,
  setIsOpen,
  willCreate = true,
  selected = {},
}) => {
  const { token } = useSelector(({ auth }) => auth),
    { formSubmitted, isSuccess } = useSelector(({ suppliers }) => suppliers),
    [form, setForm] = useState(_form),
    dispatch = useDispatch();

  useEffect(() => {
    if (willCreate) {
      setForm(_form);
    } else {
      setForm({ ..._form, ...selected });
    }
  }, [willCreate, selected, isOpen]);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      setIsOpen(false);
    }
  }, [formSubmitted, isSuccess, isOpen, setIsOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (willCreate) {
      dispatch(SAVE({ token, data: form }));
    } else {
      dispatch(UPDATE({ token, data: form }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{willCreate ? "Add" : "Update"} Supplier</DialogTitle>
          <DialogDescription>
            Enter the supplier's details. Make sure everything is correct before
            saving.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            <div className="grid w-full  items-center gap-1.5">
              <Label htmlFor="company">*Company name</Label>
              <Input
                type="text"
                value={form?.name || ""}
                onChange={({ target }) =>
                  setForm({
                    ...form,
                    name: target.value,
                  })
                }
                required
                id="company"
                placeholder="Enter company name here.."
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="person">Contact Person</Label>
                <Input
                  type="text"
                  value={form?.contact?.person || ""}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      contact: {
                        ...form.contact,
                        person: target.value,
                      },
                    })
                  }
                  id="person"
                  placeholder="Enter contact person here.."
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="phone">* Mobile No.</Label>

                <Input
                  type="text"
                  value={form?.contact?.mobile || ""}
                  required
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      contact: {
                        ...form.contact,
                        mobile: target.value,
                      },
                    })
                  }
                  id="phone"
                  placeholder="Enter phone number here.."
                />
              </div>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="address">*Address</Label>
              <Input
                type="text"
                value={form?.address || ""}
                required
                onChange={({ target }) =>
                  setForm({
                    ...form,
                    address: target.value,
                  })
                }
                id="address"
                placeholder="Enter address here.."
              />
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button type="submit" disabled={formSubmitted}>
              Submit
              {formSubmitted && (
                <Loader className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
