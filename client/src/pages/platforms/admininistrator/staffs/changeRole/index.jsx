import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { Loader } from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RESET, UPDATE } from "@/services/redux/slices/persons/staffs";
import { toast } from "sonner";
import { fullName } from "@/services/utilities";
import { Role } from "@/services/fakeDB";

const ChangeRole = ({ isOpen, setIsOpen, selected }) => {
  const { token } = useSelector(({ auth }) => auth),
    { formSubmitted, isSuccess } = useSelector(({ staffs }) => staffs),
    [form, setForm] = useState({}),
    dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      const { user = {} } = selected;
      const { role, _id = "" } = user;
      setForm({ user: _id, role });
    }
  }, [isOpen, selected]);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      toast.success("Role Successfully Changed!");
      setIsOpen(false);
      dispatch(RESET());
    }
  }, [formSubmitted, isSuccess, isOpen, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(UPDATE({ token, data: { ...form, staff: selected._id } }));
  };

  const { user = {} } = selected || {};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md ">
        <DialogHeader>
          <DialogTitle>{fullName(user?.fullName)}</DialogTitle>
          <DialogDescription>Change Role</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label>Role*</Label>
              <Select
                value={String(form.role) ?? ""}
                onValueChange={(value) =>
                  setForm({ ...form, role: Number(value) })
                }
                required={true}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Role</SelectLabel>
                    {Role.collections.map(({ id, label }) => (
                      <SelectItem key={id} value={String(id)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-5 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitted}>
              Update{" "}
              {formSubmitted && <Loader className="h-4 w-4 animate-spin" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRole;
