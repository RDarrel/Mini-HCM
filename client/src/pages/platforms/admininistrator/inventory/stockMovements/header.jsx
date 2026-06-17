import { Stock } from "@/services/utilities";
import { Activity } from "lucide-react";
import { capitalize } from "lodash";

const SummaryCard = ({
  title,
  count = 0,
  description,
  icon,
  tone = "neutral",
}) => {
  const IconComponent = icon;
  const toneClass =
    tone === "success"
      ? "border-emerald-200/70 from-emerald-50/60 to-emerald-50/20 text-emerald-800"
      : tone === "warning"
        ? "border-amber-200/60 from-amber-50/45 to-amber-50/15 text-amber-800"
        : tone === "danger"
          ? "border-red-200/70 from-red-50/60 to-red-50/20 text-red-800"
          : "border-border from-muted/40 to-muted/10 text-foreground";

  const pillClass =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800"
      : tone === "warning"
        ? "bg-amber-100 text-amber-800"
        : tone === "danger"
          ? "bg-red-100 text-red-800"
          : "bg-muted text-foreground";

  return (
    <div
      className={`rounded-[8px] border bg-gradient-to-br via-white p-2.5 shadow-sm ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-[10px] font-bold uppercase leading-none tracking-[0.16em]">
              {title}
            </p>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[13px] font-semibold leading-none ${pillClass}`}
            >
              {count}
            </span>
          </div>
          <p className="mt-1 truncate text-[11px] leading-none text-muted-foreground">
            {description}
          </p>
        </div>
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl ${pillClass}`}
        >
          {IconComponent ? <IconComponent className="h-3.5 w-3.5" /> : null}
        </span>
      </div>
    </div>
  );
};

const BatchesModalHeader = ({ selected, tracksExpiration, icons }) => {
  const availableStockLabel = Stock.display(
    selected?.stockDisplay?.current || 0,
    selected?.measurement,
  );
  const expiringSoonLabel = Stock.display(
    selected?.expiringSoon?.display || 0,
    selected?.measurement,
  );

  const expiredLabel = Stock.display(
    selected?.expired?.display || 0,
    selected?.measurement,
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-foreground">
          <Activity className="h-5 w-5" />
          <p className="text-lg font-semibold leading-none tracking-tight">
            Stock Movements — {capitalize(selected?.name || "Selected Item")}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Review stock activity, adjustments, and inventory movement history.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <SummaryCard
          title="Available Stock"
          count={availableStockLabel}
          description="Items ready to use"
          icon={icons.available}
          tone="success"
        />
        <SummaryCard
          title="Expiring Soon"
          count={tracksExpiration ? expiringSoonLabel : "N/A"}
          description={
            tracksExpiration ? "Reorder / use first" : "Expiration not tracked"
          }
          icon={icons.soon}
          tone={tracksExpiration ? "warning" : "neutral"}
        />
        <SummaryCard
          title="Expired"
          count={tracksExpiration ? expiredLabel : "N/A"}
          description={
            tracksExpiration ? "Needs disposal" : "Expiration not tracked"
          }
          icon={icons.expired}
          tone={tracksExpiration ? "danger" : "neutral"}
        />
      </div>
    </div>
  );
};

export default BatchesModalHeader;
