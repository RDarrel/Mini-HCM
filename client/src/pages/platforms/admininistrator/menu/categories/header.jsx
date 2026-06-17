import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  BROWSE,
  SEARCH,
  SetCREATE,
} from "@/services/redux/slices/menu/categories";

const CategoryHeader = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { search } = useSelector(({ menuCategories }) => menuCategories);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(BROWSE({ token }));
    }
  }, [dispatch, token]);

  return (
    <CardHeader className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle className="text-2xl text-foreground">Categories</CardTitle>
          <CardDescription>
            Manage the categories that will be assigned to your menu items.
          </CardDescription>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end lg:max-w-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => dispatch(SEARCH(event.target.value))}
              placeholder="Search category..."
              className="pl-9"
              type="search"
            />
          </div>

          <Button onClick={() => dispatch(SetCREATE())}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default CategoryHeader;
