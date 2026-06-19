const InfoPanel = ({ icon, label, value }) => {
  const PanelIcon = icon;

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {PanelIcon && <PanelIcon className="size-4 text-primary" />}
        <span>{label}</span>
      </div>
      <p className="mt-2 font-semibold tabular-nums">{value}</p>
    </div>
  );
};

const InlineMetric = ({ icon, label, value }) => {
  const MetricIcon = icon;

  return (
    <div className="flex items-center gap-2 text-sm">
      <MetricIcon className="size-4 text-primary" />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
};

const PunchCell = ({ label, value }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 font-semibold tabular-nums">{value}</p>
  </div>
);

const SummaryBox = ({ icon, label, value }) => {
  const SummaryIcon = icon;

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {SummaryIcon && (
          <SummaryIcon className="size-4 text-muted-foreground" />
        )}
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
};

export { InfoPanel, InlineMetric, PunchCell, SummaryBox };
