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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { Eye, EyeOff, Loader } from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
import { RESET, SAVE } from "@/services/redux/slices/persons/staffs";
import { toast } from "sonner";
import { Role } from "@/services/fakeDB";

const AddStaff = ({ isOpen, setIsOpen }) => {
  const { token } = useSelector(({ auth }) => auth),
    { formSubmitted } = useSelector(({ staffs }) => staffs),
    [form, setForm] = useState({}),
    [showPassword, setShowPassword] = useState(false),
    [showCPassword, setShowCPassword] = useState(false),
    [notMatchPassword, setNotMatchPassword] = useState(false),
    [passRules, setPassRules] = useState({
      hasLong: false,
      hasNumber: false,
      hasSpecialChar: false,
    }),
    dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      setForm({ role: 2 });
    }
  }, [isOpen]);

  useEffect(() => {
    const { password = "" } = form;
    const hasLong = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPassRules({
      hasLong,
      hasNumber,
      hasSpecialChar,
    });
  }, [form]);

  const { hasLong = false, hasNumber, hasSpecialChar } = passRules;
  const weekPassword = !hasLong || !hasNumber || !hasSpecialChar;

  const handleSubmit = (e) => {
    e.preventDefault();
    const { password, cPassword } = form;
    if (!isEqual(password, cPassword)) {
      setNotMatchPassword(true);
      return;
    } else {
      dispatch(SAVE({ token, data: form }))
        .unwrap()
        .then(() => {
          toast.success("Staff Successfully Added!");
          setIsOpen(false);
          dispatch(RESET());
          setNotMatchPassword(false);
        })
        .catch((error) => {
          toast.error(error?.message || error || "Failed to add staff.");
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Staff Registration</DialogTitle>
          <DialogDescription>
            Please provide the necessary details to complete the staff
            registration. Click register when you're done.
          </DialogDescription>
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
            <div className="grid grid-cols-2 gap-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="fname">First Name*</Label>
                <Input
                  type="text"
                  value={form?.fullName?.fname}
                  required
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      fullName: { ...form.fullName, fname: target.value },
                    })
                  }
                  id="fname"
                  placeholder="Enter first name here.."
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="mname">Middle Name (Optional)</Label>

                <Input
                  type="text"
                  value={form?.fullName?.mname}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      fullName: { ...form.fullName, mname: target.value },
                    })
                  }
                  id="mname"
                  placeholder="Enter middle name here.."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="lname">Last Name*</Label>
                <Input
                  type="text"
                  required
                  value={form?.fullName?.lname}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      fullName: { ...form.fullName, lname: target.value },
                    })
                  }
                  id="lname"
                  placeholder="Enter last name here.."
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email*</Label>
                <Input
                  type="text"
                  id="email"
                  required
                  value={form.email}
                  onChange={({ target }) =>
                    setForm({ ...form, email: target.value })
                  }
                  placeholder="Enter email here.."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="grid w-full max-w-sm items-center gap-1.5 ">
                  <Label htmlFor="password">Password*</Label>

                  <div className="relative">
                    <Input
                      required
                      value={form?.password}
                      onChange={({ target }) =>
                        setForm({ ...form, password: target.value })
                      }
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter password here.."
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="cPassword">Confirm Password*</Label>

                <div className="relative">
                  <Input
                    value={form?.cPassword}
                    onChange={({ target }) =>
                      setForm({ ...form, cPassword: target.value })
                    }
                    type={showCPassword ? "text" : "password"}
                    id="cPassword"
                    placeholder="Enter confirm password here.."
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowCPassword(!showCPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showCPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 -mt-4">
              <div>
                {weekPassword && form?.password && (
                  <h2 className="text-[15px] font-[600] text-red-900 mb-1">
                    Weak Password
                  </h2>
                )}
                <h2 className={cn("text-[13px] ", hasLong && "text-green-700")}>
                  *Password must be atleast 8 characters long
                </h2>
                <h2
                  className={cn("text-[13px] ", hasNumber && "text-green-700")}
                >
                  *Password must include at lease one number (0-9)
                </h2>
                <h2
                  className={cn(
                    "text-[13px] ",
                    hasSpecialChar && "text-green-700",
                  )}
                >
                  *Password must contain at least one special character
                  (eg,@,*,!,$)
                </h2>
              </div>
              <div>
                {notMatchPassword && (
                  <h2 className="text-[13px] text-red-700">
                    Password and confirm password do not match
                  </h2>
                )}
              </div>
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
            <Button type="submit" disabled={weekPassword || formSubmitted}>
              Register{" "}
              {formSubmitted && <Loader className="h-4 w-4 animate-spin" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaff;
