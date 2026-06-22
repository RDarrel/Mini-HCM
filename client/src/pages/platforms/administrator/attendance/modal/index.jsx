import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Lock, Save, UserRound } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Formatter } from "@/utilities";
import {
  LockedDate,
  TimeInput,
  TimeCard,
  InfoPill,
  IconBox,
  TimeOutDateButton,
} from "./components";
import { toast } from "sonner";
import { UPDATE } from "@/redux/slices/attendance";
import { timeValue, isoDateValue, getNextWorkDate, initialForm } from "./utils";
import Spinner from "@/components/shared/spinner";

const EmployeeModal = ({ isOpen, setIsOpen, selected: employee = {} }) => {
  const { isSubmitting } = useSelector(({ attendance }) => attendance);
  const [form, setForm] = useState(initialForm);
  const dispatch = useDispatch();

  const timezone = employee?.timezone || "Asia/Manila";
  const workDate = employee?.workDate || "";

  const nextWorkDate = useMemo(
    () => getNextWorkDate(workDate, timezone),
    [timezone, workDate],
  );

  // Limit Time Out date choices to workDate and nextWorkDate only.
  const timeOutDates = useMemo(
    () => [workDate, nextWorkDate].filter(Boolean),
    [nextWorkDate, workDate],
  );

  const schedule = employee?.user?.schedule || {};
  const scheduleTimeIn = schedule?.timeIn || schedule?.start;
  const timeInMaxTime = schedule?.timeOut || schedule?.end;
  const isSameDayTimeout = form.timeOutDate === workDate;
  const timeOutMinTime = isSameDayTimeout ? scheduleTimeIn : undefined;

  // Prefill form from the selected attendance record when modal opens.
  useEffect(() => {
    if (!isOpen) return setForm(initialForm);
    if (!workDate) return;

    const timeOutDate = isoDateValue(employee?.timeOut, timezone) || workDate;

    setForm({
      timeInTime: timeValue(employee?.timeIn, timezone),
      timeOutDate: timeOutDates.includes(timeOutDate) ? timeOutDate : workDate,
      timeOutTime: timeValue(employee?.timeOut, timezone),
      reason: "",
    });
  }, [employee, isOpen, timeOutDates, timezone, workDate]);

  const onChange =
    (field) =>
    ({ target }) =>
      setForm((current) => ({ ...current, [field]: target.value }));

  const setTimeOutDate = (timeOutDate) =>
    setForm((current) => ({ ...current, timeOutDate }));

  const closeModal = () => {
    setIsOpen(false);
    setForm(initialForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.timeInTime || !form.timeOutDate || !form.timeOutTime) {
      return toast.warning("Time In and Time Out are required");
    }

    if (!form.reason.trim()) {
      return toast.warning("Reason is required");
    }

    const timeIn = new Date(`${workDate}T${form.timeInTime}:00`);
    const timeOut = new Date(`${form.timeOutDate}T${form.timeOutTime}:00`);

    if (timeOutMinTime && form.timeOutTime === timeOutMinTime) {
      return toast.warning(
        "Time Out must not be equal to the schedule time in",
      );
    }

    if (timeOut <= timeIn) {
      return toast.warning("Time Out must be after Time In");
    }

    const payload = {
      id: employee.attendanceId || employee.id,
      userId: employee.userId,
      timeIn: `${workDate}T${form.timeInTime}:00`,
      timeOut: `${form.timeOutDate}T${form.timeOutTime}:00`,
      reason: form.reason.trim(),
    };

    dispatch(UPDATE(payload))
      .unwrap()
      .then(() => {
        closeModal();
        toast.success("Successfully updated attendance");
      })
      .catch((error) => toast.error(error.message || error.toString()));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (open ? setIsOpen(open) : closeModal())}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <IconBox icon={Clock} />
            <div>
              <DialogTitle>Edit Attendance Time</DialogTitle>
              <DialogDescription className="mt-0.5">
                Adjust punch times for the selected work date.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 px-5 py-4">
            <div className="grid gap-2 rounded-md border bg-muted/20 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-2.5">
                <IconBox icon={UserRound} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {Formatter.fullName(employee?.user?.name)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current: {Formatter.time(employee.timeIn, timezone)} -{" "}
                    {Formatter.time(employee.timeOut, timezone)}
                  </p>
                </div>
              </div>

              <div className="grid gap-1 sm:grid-cols-2">
                <InfoPill
                  icon={CalendarDays}
                  label="Work date"
                  value={Formatter.date(workDate, false, timezone)}
                />
                <InfoPill
                  icon={Clock}
                  label="Schedule"
                  value={Formatter.scheduleTime(employee?.user?.schedule)}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <TimeCard title="Time In" icon={Lock}>
                <LockedDate value={Formatter.date(workDate, false, timezone)} />
                <TimeInput
                  id="timeInTime"
                  max={timeInMaxTime}
                  value={form.timeInTime}
                  onChange={onChange("timeInTime")}
                />
              </TimeCard>

              <TimeCard title="Time Out">
                <div className="grid gap-1.5">
                  <Label>Date</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeOutDates.map((date) => (
                      <TimeOutDateButton
                        key={date}
                        date={date}
                        isSelected={form.timeOutDate === date}
                        onClick={setTimeOutDate}
                        timezone={timezone}
                        workDate={workDate}
                      />
                    ))}
                  </div>
                </div>
                <TimeInput
                  id="timeOutTime"
                  min={timeOutMinTime}
                  value={form.timeOutTime}
                  onChange={onChange("timeOutTime")}
                />
              </TimeCard>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="reason">Reason for Edit</Label>
              <Textarea
                id="reason"
                className="min-h-20"
                placeholder="Explain why this attendance record needs correction."
                value={form.reason}
                onChange={onChange("reason")}
                required
              />
            </div>
          </div>

          <DialogFooter className="border-t px-5 py-3">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="size-4" />
              Save Changes
              <Spinner isLoading={isSubmitting} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeModal;
