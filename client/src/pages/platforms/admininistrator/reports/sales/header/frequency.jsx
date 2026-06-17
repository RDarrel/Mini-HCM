import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { SetFREQUENCY } from "@/services/redux/slices/commerce/deals";
const Frequency = () => {
  const { frequency } = useSelector(({ deals }) => deals),
    dispatch = useDispatch();

  return (
    <Select value={frequency} onValueChange={(e) => dispatch(SetFREQUENCY(e))}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Select a frequency" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frequency</SelectLabel>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default Frequency;
