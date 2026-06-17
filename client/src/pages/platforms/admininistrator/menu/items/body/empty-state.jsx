import { SetCREATE } from "@/services/redux/slices/menu/menus";
import { Plus, UtensilsCrossed } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

const EmptyState = () => {
  const dispatch = useDispatch();
  const { collections, cluster, filtered, search, category } = useSelector(
    ({ menus }) => menus,
  );
  const { collections: categories } = useSelector(
    ({ menuCategories }) => menuCategories,
  );

  const hasMenus = collections.length > 0;
  const hasSearch = search.trim().length > 0;
  const hasCategoryFilter = category && category !== "all";
  const hasCategoryMatches = cluster.length > 0;
  const hasFilteredResults = filtered.length > 0;
  const categoryLabel = hasCategoryFilter
    ? categories?.find((item) => item?._id === category).name
    : "this category";
  const emptyState = (() => {
    if (!hasMenus) {
      return {
        title: "No menu items yet",
        description: "There are no menus available yet for this branch.",
        actionLabel: "Create First Menu",
      };
    }

    if (hasSearch && hasCategoryFilter && !hasFilteredResults) {
      return {
        title: `No "${search}" in ${categoryLabel}`,
        description: `There are no menu items matching "${search}" under ${categoryLabel}.`,
        actionLabel: `Add Menu to ${categoryLabel}`,
      };
    }

    if (hasSearch && !hasFilteredResults && hasCategoryMatches) {
      return {
        title: "No matching menu items found",
        description: `No menu matched "${search}" in the current list.`,
        actionLabel: "Create Menu Item",
      };
    }

    if (!hasFilteredResults && hasCategoryFilter) {
      return {
        title: "No menu items for this category",
        description: `There are no menu items under ${categoryLabel} right now.`,
        actionLabel: `Add Menu to ${categoryLabel}`,
      };
    }

    return {
      title: "No menu items found",
      description: "There are no menu items to display right now.",
      actionLabel: "Create Menu Item",
    };
  })();

  return (
    <div className="rounded-3xl border border-dashed border-border/80 bg-card/95 p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        <UtensilsCrossed className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-semibold tracking-tight">
        {emptyState.title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {emptyState.description}
      </p>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => dispatch(SetCREATE())}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {emptyState.actionLabel}
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
