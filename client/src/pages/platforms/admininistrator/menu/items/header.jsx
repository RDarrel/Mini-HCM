import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UtensilsCrossed,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FilterBY_CATEGORY,
  FilterBY_AVAILABILITY,
  SEARCH,
  SetCREATE,
} from "@/services/redux/slices/menu/menus";
const Header = () => {
  const {
    category: actCategory,
    availability,
    search,
    collections = [],
    isLoading,
  } = useSelector(({ menus }) => menus);
  const { collections: categories = [] } = useSelector(
    ({ menuCategories }) => menuCategories,
  );
  const dispatch = useDispatch();
  const totalMenus = collections.length;

  const scrollerRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    cleanup: null,
  });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    // Tiny epsilon because of fractional scroll values.
    const epsilon = 1;
    setCanScrollLeft(el.scrollLeft > epsilon);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - epsilon,
    );
  }, []);

  useEffect(() => {
    updateScrollButtons();

    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => updateScrollButtons();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateScrollButtons, categories?.length, isLoading]);

  const scrollByAmount = useCallback((delta) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  const endPointer = useCallback((e) => {
    const el = scrollerRef.current;
    const didDrag = dragRef.current.moved;
    dragRef.current.isDragging = false;
    setIsDragging(false);
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore.
    }

    if (typeof dragRef.current.cleanup === "function")
      dragRef.current.cleanup();

    // Allow click again after the drag gesture fully finishes (prevents "dead" categories).
    if (didDrag) {
      setTimeout(() => {
        dragRef.current.moved = false;
      }, 0);
    }
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      const el = scrollerRef.current;
      if (!el) return;

      // Only left mouse button; allow touch/pen as-is.
      if (e.pointerType === "mouse" && e.button !== 0) return;

      // Clear any previous listeners/state just in case.
      if (typeof dragRef.current.cleanup === "function")
        dragRef.current.cleanup();

      dragRef.current.isDragging = false;
      dragRef.current.pointerId = e.pointerId;
      dragRef.current.startX = e.clientX;
      dragRef.current.startScrollLeft = el.scrollLeft;
      dragRef.current.moved = false;

      // If the user releases the pointer outside the scroller, we still need to stop dragging.
      const onWindowPointerUp = (ev) => {
        if (dragRef.current.pointerId !== ev.pointerId) return;
        endPointer(ev);
      };

      const onWindowPointerCancel = (ev) => {
        if (dragRef.current.pointerId !== ev.pointerId) return;
        endPointer(ev);
      };

      window.addEventListener("pointerup", onWindowPointerUp);
      window.addEventListener("pointercancel", onWindowPointerCancel);

      dragRef.current.cleanup = () => {
        window.removeEventListener("pointerup", onWindowPointerUp);
        window.removeEventListener("pointercancel", onWindowPointerCancel);
        dragRef.current.cleanup = null;
      };
    },
    [endPointer],
  );

  const handlePointerMove = useCallback(
    (e) => {
      const el = scrollerRef.current;
      if (!el) return;
      if (dragRef.current.pointerId !== e.pointerId) return;

      // For mouse, only allow dragging while left button is actually held down.
      if (e.pointerType === "mouse" && (e.buttons & 1) === 0) {
        endPointer(e);
        return;
      }

      const dx = e.clientX - dragRef.current.startX;
      if (Math.abs(dx) <= 4 && !dragRef.current.isDragging) return;

      if (!dragRef.current.isDragging) {
        dragRef.current.isDragging = true;
        setIsDragging(true);
        dragRef.current.moved = true;

        // Once we know it's a drag, capture the pointer so the gesture stays consistent.
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // Ignore if the browser doesn't support it.
        }
      }

      // While dragging, avoid any native drag/selection behaviors and scroll chaining.
      e.preventDefault();
      el.scrollLeft = dragRef.current.startScrollLeft - dx;
    },
    [endPointer],
  );

  const handleWheel = useCallback((e) => {
    const el = scrollerRef.current;
    if (!el) return;

    // Only intercept horizontal intent. Vertical wheel should keep scrolling the page.
    const horizontalIntent =
      e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!horizontalIntent) return;

    if (el.scrollWidth <= el.clientWidth) return;

    // Prevent the page (parent) from getting a horizontal scrollbar via scroll chaining.
    e.preventDefault();
    const delta = e.shiftKey ? e.deltaY : e.deltaX;
    el.scrollLeft += delta;
  }, []);

  const handleCategoryClick = useCallback(
    (categoryId) => {
      // If user just dragged the row, don't treat it as a click.
      if (dragRef.current.moved) return;
      dispatch(FilterBY_CATEGORY(categoryId));
    },
    [dispatch],
  );

  const categoryCounts = categories.reduce((accumulator, category) => {
    accumulator[category._id] = collections.filter(
      (item) => item.category === category._id,
    ).length;
    return accumulator;
  }, {});

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UtensilsCrossed className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold leading-tight">
                Menu Items
              </h1>
              {totalMenus > 0 && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {totalMenus} total
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your restaurant items, stock, and publish readiness.
            </p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end md:gap-3 xl:w-auto">
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full min-w-0 sm:max-w-[300px] sm:flex-1 md:w-[250px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => dispatch(SEARCH(e.target.value))}
                className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(SetCREATE())}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      <div className="mt-4 grid w-full min-w-0 grid-cols-[auto_1fr] items-center gap-1.5 sm:gap-2 md:grid-cols-[auto_auto_1fr_auto]">
        <Select
          value={availability}
          onValueChange={(value) =>
            dispatch(FilterBY_AVAILABILITY(value || "all"))
          }
        >
          <SelectTrigger
            aria-label="Filter by availability"
            title="Availability"
            className="h-8 w-[88px] shrink-0 overflow-hidden rounded-full bg-background sm:h-9 sm:w-[110px] md:w-[150px]"
            size="sm"
          >
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
              <SelectValue placeholder="All" />
            </span>
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>

        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollByAmount(-240)}
          disabled={!canScrollLeft}
          className={`hidden h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-border bg-card/80 text-foreground shadow-sm backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:inline-flex md:h-9 md:w-9 ${
            canScrollLeft ? "hover:bg-card" : "opacity-30 cursor-default"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="relative w-full min-w-0 overflow-hidden">
          {canScrollLeft && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent" />
          )}
          {canScrollRight && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent" />
          )}

          <div
            ref={scrollerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            onWheel={handleWheel}
            style={{ touchAction: "pan-y" }}
            className={`no-scrollbar overscroll-x-contain flex w-full min-w-0 flex-nowrap gap-1.5 overflow-x-auto py-0.5 select-none sm:gap-2 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {isLoading
              ? new Array(12)
                  .fill("")
                  .map((_, index) => (
                    <Skeleton
                      key={index}
                      className={`h-8 shrink-0 rounded-full sm:h-9 ${
                        index % 6 === 0
                          ? "w-16"
                          : index % 6 === 1
                            ? "w-24"
                            : index % 6 === 2
                              ? "w-20"
                              : index % 6 === 3
                                ? "w-28"
                                : index % 6 === 4
                                  ? "w-24"
                                  : "w-32"
                      }`}
                    />
                  ))
              : [{ _id: "all", name: "All" }, ...categories].map((category) => {
                  const isActive = actCategory === category?._id;
                  const categoryCount = categoryCounts[category?._id];

                  return (
                    <button
                      key={category?._id || category?.name}
                      type="button"
                      onClick={() => handleCategoryClick(category?._id)}
                      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 py-0 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-9 sm:gap-2 sm:px-4 sm:text-sm ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      <span className="max-w-[96px] truncate sm:max-w-[120px] md:max-w-none">
                        {category?.name}
                      </span>
                      {category?._id !== "all" && categoryCount > 0 && (
                        <span
                          className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                            isActive
                              ? "bg-primary-foreground/15 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {categoryCount}
                        </span>
                      )}
                    </button>
                  );
                })}
          </div>
        </div>

        <button
          type="button"
          aria-label="Scroll categories right"
          onClick={() => scrollByAmount(240)}
          disabled={!canScrollRight}
          className={`hidden h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-border bg-card/80 text-foreground shadow-sm backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:inline-flex md:h-9 md:w-9 ${
            canScrollRight ? "hover:bg-card" : "opacity-30 cursor-default"
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Header;
