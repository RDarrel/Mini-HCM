import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const AVAILABLE_MAXPAGES = [5, 10, 15, 20, 25];

const RowsPerPage = ({ maxPage, setMaxPage }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <p className="text-sm font-semibold sm:text-h5">Rows Per Page</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="flex h-8 items-center justify-center px-3"
            variant={"outline"}
          >
            <p>{maxPage}</p> <ChevronDown color="gray" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[5rem]">
          <DropdownMenuLabel>Rows Per Page</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {AVAILABLE_MAXPAGES.map((max, index) => (
              <DropdownMenuItem
                key={index}
                // checked={maxPage === max}
                className="flex justify-between"
                onClick={() => setMaxPage(max)}
              >
                {max} {max === maxPage && <Check />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RowsPerPage;
