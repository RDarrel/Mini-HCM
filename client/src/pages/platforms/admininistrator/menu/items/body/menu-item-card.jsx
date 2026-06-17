import Cloudinary from "@/services/utilities/cloudinary";
import { capitalize, Formatter } from "@/services/utilities";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  EllipsisVertical,
  Info,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DETAIL_HINT_BY_TYPE,
  EMPTY_CTA_BY_TYPE,
  EMPTY_STATE_BY_TYPE,
  getCountLabel,
  getDetailEntries,
  getManageLabel,
  getMenuTypeMeta,
  getRecommendedAddOnEntries,
  getSetupCtaDescription,
  getSetupCtaLabel,
  getSetupNowLabel,
  getItemTypePillLabel,
} from "./utils";

const MenuItemCard = ({
  item,
  categories,
  openDetailId,
  setOpenDetailId,
  activeDetailTab,
  setActiveDetailTab,
  activeMenuId,
  setActiveMenuId,
  isAvailabilityBusy,
  isCashierVisible,
  onAvailabilityToggle,
  onEdit,
  onSetup,
  onRequestDelete,
}) => {
  const isActionOpen = activeMenuId === item?._id;

  const detailEntries = getDetailEntries(item, categories);
  const recommendedEntries = getRecommendedAddOnEntries(
    item?.recommendedAddOns || [],
  );
  const typeMeta = getMenuTypeMeta(item?.type);
  const TypeIcon = typeMeta.icon;

  const hasBreakdown = detailEntries.length > 0;
  const hasRecommendedAddOns = recommendedEntries.length > 0;
  const shouldEnableCollapse = hasBreakdown || hasRecommendedAddOns;
  const isDetailsOpen = shouldEnableCollapse && openDetailId === item?._id;
  const isOverlayOpen = isDetailsOpen;

  const typePillLabel = getItemTypePillLabel(item?.type);

  return (
    <Collapsible
      open={shouldEnableCollapse ? isDetailsOpen : false}
      onOpenChange={(open) => {
        if (!shouldEnableCollapse) return;
        setOpenDetailId(open ? item?._id : null);
        setActiveDetailTab("details");
      }}
      className={`group relative transition-transform duration-300 hover:-translate-y-1 ${
        isOverlayOpen ? "z-20" : ""
      }`}
    >
      <div
        className={`relative flex h-full flex-col overflow-visible rounded-2xl bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg`}
      >
        <div className="relative h-52 overflow-hidden rounded-t-2xl bg-muted/40">
          <img
            src={
              item?.imgId
                ? Cloudinary.getMenuImg(item.imgId, item?._id)
                : item?.image
            }
            alt={item?.name}
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute top-2 flex w-full items-start justify-between gap-1.5 px-2">
            <button
              type="button"
              disabled={isAvailabilityBusy}
              onClick={() =>
                onAvailabilityToggle?.(item, isCashierVisible, hasBreakdown)
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold shadow-md backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
                isCashierVisible
                  ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
                  : "border-white/30 bg-black/55 text-white"
              }`}
            >
              <span>{isCashierVisible ? "Available" : "Unavailable"}</span>
              <span
                className={`relative h-3.5 w-6 rounded-full transition ${
                  isCashierVisible ? "bg-emerald-500/90" : "bg-white/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition ${
                    isCashierVisible ? "left-3" : "left-0.5"
                  }`}
                />
              </span>
            </button>

            <div className="flex flex-col items-end gap-1.5">
              {item?.description ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="View description"
                      title="Description"
                      className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/90 text-primary shadow-md backdrop-blur-sm transition hover:bg-white"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    sideOffset={10}
                    className="max-w-xs"
                  >
                    {item.description}
                  </TooltipContent>
                </Tooltip>
              ) : null}

              <button
                type="button"
                title="Actions"
                onClick={() =>
                  setActiveMenuId((current) =>
                    current === item?._id ? null : item?._id,
                  )
                }
                className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/90 text-primary shadow-md backdrop-blur-sm transition hover:bg-white"
              >
                <EllipsisVertical className="h-3 w-3" />
              </button>

              {isActionOpen && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit?.(item)}
                    className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/90 text-primary shadow-md backdrop-blur-sm transition hover:bg-white"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestDelete?.(item)}
                    className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-red-500/90 text-white shadow-md backdrop-blur-sm transition hover:bg-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-white">
                {item?.name}
              </h2>
            </div>

            <div className="rounded-xl bg-white/90 px-3 py-2 text-sm font-bold text-primary shadow">
              {Formatter.amount(item?.price)}
            </div>
          </div>
        </div>

        <div
          className={`flex flex-1 flex-col bg-card px-4 pb-3 pt-3 ${
            isDetailsOpen
              ? "rounded-b-none border-x-2 border-primary/40 border-b-0"
              : "rounded-b-2xl border-x border-b border-border"
          }`}
        >
          {shouldEnableCollapse ? (
            <CollapsibleTrigger asChild>
              <button
                type="button"
                onClick={() => setActiveDetailTab("details")}
                className="mt-0 flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/10 px-3 py-2.5 text-left transition hover:border-border hover:bg-muted/20"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                    <TypeIcon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {typeMeta.title}
                      {hasRecommendedAddOns ? " & Add-ons" : ""}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {hasBreakdown
                        ? DETAIL_HINT_BY_TYPE[item?.type]
                        : EMPTY_STATE_BY_TYPE[item?.type] ||
                          EMPTY_STATE_BY_TYPE.prepared}
                      {hasRecommendedAddOns
                        ? ` • ${recommendedEntries.length} add-ons`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {hasBreakdown && typePillLabel && (
                    <span className="rounded-full bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {typePillLabel}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      isDetailsOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
            </CollapsibleTrigger>
          ) : (
            <button
              type="button"
              onClick={() => onSetup?.(item)}
              className="mt-0 flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-left transition hover:border-primary/30 hover:bg-primary/10"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TypeIcon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">
                    {getSetupCtaLabel(item?.type)}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {getSetupCtaDescription(item?.type)}
                  </p>
                </div>
              </div>
              <Plus className="h-4 w-4 text-primary" />
            </button>
          )}
        </div>
      </div>

      {shouldEnableCollapse ? (
        <CollapsibleContent className="absolute left-0  top-full z-30 -mt-3 w-full overflow-hidden opacity-100 transition-opacity duration-200 ease-out data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=open]:opacity-100">
          <div
            className={`relative mb-2 rounded-b-2xl border border-t-0 bg-card px-3 pb-3 pt-4 shadow-none ${
              isDetailsOpen
                ? "border-2 border-primary/40 border-t-0"
                : "border-border"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-6 top-[6px] h-px bg-border/70" />

            {hasRecommendedAddOns ? (
              <div className="mb-3">
                <div className="flex w-full max-w-full rounded-xl border border-border bg-background p-1">
                  <button
                    type="button"
                    onClick={() => setActiveDetailTab("details")}
                    className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition ${
                      activeDetailTab === "details"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {typeMeta.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDetailTab("addons")}
                    className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition ${
                      activeDetailTab === "addons"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    Add-ons ({recommendedEntries.length})
                  </button>
                </div>
              </div>
            ) : null}

            {activeDetailTab === "addons" ? (
              hasRecommendedAddOns ? (
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {recommendedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {capitalize(entry.name)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {capitalize(entry.group)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-foreground">
                        {Formatter.amount(entry.price)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background/50 px-4 py-6 text-sm text-muted-foreground">
                  No recommended add-ons yet.
                </div>
              )
            ) : hasBreakdown ? (
              <>
                <div className="max-h-50 space-y-2 overflow-y-auto pr-1">
                  {item?.type === "bundle"
                    ? detailEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {entry.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.category || "Uncategorized"}
                              {entry.type ? ` | ${capitalize(entry.type)}` : ""}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-foreground">
                              x{entry.quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Formatter.amount(entry.price * entry.quantity)}
                            </p>
                          </div>
                        </div>
                      ))
                    : detailEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {entry.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.category
                                ? capitalize(entry.category)
                                : "Inventory item"}
                              {entry.type ? ` | ${capitalize(entry.type)}` : ""}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-foreground">
                              {entry.quantity} {entry.unit}
                            </p>
                            {item?.type === "resell" && (
                              <p className="text-xs text-muted-foreground">
                                {Formatter.amount(entry.cost)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background/50 p-4">
                <div className="min-w-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {EMPTY_CTA_BY_TYPE[item?.type]?.title ||
                        EMPTY_CTA_BY_TYPE.prepared.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {getSetupCtaDescription(item?.type)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSetup?.(item)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {getSetupNowLabel(item?.type)}
                </button>
              </div>
            )}

            {(activeDetailTab === "addons" || hasBreakdown) && (
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                <p className="text-[11px] text-muted-foreground">
                  {activeDetailTab === "addons"
                    ? getCountLabel(recommendedEntries.length, "add-ons")
                    : getCountLabel(
                        detailEntries.length,
                        typeMeta.summaryLabel,
                      )}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    activeDetailTab === "addons"
                      ? onSetup?.(item, "addons")
                      : onSetup?.(item, "setup")
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {activeDetailTab === "addons"
                    ? "Manage Add-ons"
                    : getManageLabel(item?.type)}
                </button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  );
};

export default MenuItemCard;
