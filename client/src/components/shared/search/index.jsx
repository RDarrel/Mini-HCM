import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CirclePlus } from "lucide-react";
import React from "react";

const Search = ({
  search = "",
  setSearch,
  setIsOpen,
  title = "staffs",
  haveAction = true,
}) => {
  return (
    <div className="flex align-items-center gap-3">
      <Input
        placeholder={`Search ${title}`}
        className="w-55"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type={"search"}
      />
      {haveAction && (
        <Button
          variant={"outline"}
          type="button"
          onClick={() => setIsOpen(true)}
        >
          <CirclePlus />
        </Button>
      )}
    </div>
  );
};

export default Search;
