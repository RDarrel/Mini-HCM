import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const KPIs = ({ title = "", description = "", kpis }) => {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((item) => (
            <KPI key={item.label} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPIs;

const KPI = ({ label, value, helper, icon }) => {
  const KpiIcon = icon;

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <KpiIcon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{helper}</p>
    </div>
  );
};
