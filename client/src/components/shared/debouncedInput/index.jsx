import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const DebouncedInput = ({
  value = "",
  onDebounce,
  delay = 500,
  label = "Search",
}) => {
  const [search, setSearch] = useState(value);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onDebounce?.(search.trim());
    }, delay);

    return () => clearTimeout(timeout);
  }, [search, delay, onDebounce]);

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={label}
        className="pl-9"
        type="search"
      />
    </div>
  );
};

export default DebouncedInput;
