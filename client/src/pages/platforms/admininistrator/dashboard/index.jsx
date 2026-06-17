import React, { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Building2,
  CalendarDays,
  ChefHat,
  ClipboardList,
  PhilippinePeso,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "@/services/utilities";

const KPI = ({ title, value, delta, icon: Icon, helper }) => (
  <Card className="relative overflow-hidden transition-shadow hover:shadow-sm">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent" />
    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">{title}</p>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-semibold leading-none tracking-tight">{value}</p>
          {typeof delta === "number" && (
            <Badge
              variant="secondary"
              className={cn(
                "h-5 px-2 text-[11px]",
                delta >= 0
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
              )}
            >
              {delta >= 0 ? "+" : ""}
              {delta}%
            </Badge>
          )}
        </div>
        {helper ? <p className="text-muted-foreground text-xs">{helper}</p> : null}
      </div>
      <div className="bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-md border">
        {React.createElement(Icon, { className: "h-4 w-4" })}
      </div>
    </CardHeader>
    <CardContent className="pt-2">
      <div className="bg-muted/70 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(10, 40 + (delta || 0)))}%` }}
        />
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }) => {
  const mapped = String(status || "").toLowerCase();
  const { variant, className, label } =
    mapped === "confirmed"
      ? { variant: "secondary", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", label: "Confirmed" }
      : mapped === "pending"
        ? { variant: "secondary", className: "bg-amber-500/10 text-amber-800 dark:text-amber-200", label: "Pending" }
        : mapped === "preparing"
          ? { variant: "secondary", className: "bg-sky-500/10 text-sky-800 dark:text-sky-200", label: "Preparing" }
          : mapped === "served"
            ? { variant: "secondary", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", label: "Served" }
            : mapped === "cancelled"
              ? { variant: "destructive", className: "", label: "Cancelled" }
              : { variant: "outline", className: "", label: status || "—" };

  return (
    <Badge variant={variant} className={cn("h-5 px-2 text-[11px]", className)}>
      {label}
    </Badge>
  );
};

const Dashboard = () => {
  const [range, setRange] = useState("30d");

  const series30 = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - idx));

      const t = idx + 1;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const trend = 0.92 + idx / 72;

      const revenueWave = 1800 * Math.sin(t / 3.4) + 900 * Math.cos(t / 7.2);
      const revenueBoost = (isWeekend ? 3200 : 0) + (t % 9 === 0 ? 1200 : 0);
      const revenue = Math.max(0, Math.round(15000 * trend + revenueWave + revenueBoost));

      const ordersWave = 8 * Math.sin(t / 4.1) + 4 * Math.cos(t / 6.6);
      const ordersBoost = (isWeekend ? 14 : 0) + (t % 10 === 0 ? 6 : 0);
      const orders = Math.max(0, Math.round(58 * trend + ordersWave + ordersBoost));

      const cateringWave = 2.4 * Math.sin(t / 3.8) + 1.3 * Math.cos(t / 6.1);
      const cateringBoost = (isWeekend ? 2 : 0) + (t % 7 === 0 ? 3 : 0);
      const catering = Math.max(0, Math.round(6 * trend + cateringWave + cateringBoost));

      const venueWave = 1.6 * Math.cos(t / 5.7) + 0.9 * Math.sin(t / 8.4);
      const venueBoost = (t % 12 === 0 ? 2 : 0) + (isWeekend ? 1 : 0);
      const venue = Math.max(0, Math.round(2 * trend + venueWave + venueBoost));

      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue,
        orders,
        catering,
        venue,
      };
    });
  }, []);

  const series = useMemo(() => {
    if (range === "7d") return series30.slice(-7);
    if (range === "14d") return series30.slice(-14);
    return series30;
  }, [range, series30]);

  const totals = useMemo(() => {
    const revenue = series.reduce((acc, x) => acc + x.revenue, 0);
    const orders = series.reduce((acc, x) => acc + x.orders, 0);
    const catering = series.reduce((acc, x) => acc + x.catering, 0);
    const venue = series.reduce((acc, x) => acc + x.venue, 0);

    const prev = series30.slice(-(series.length * 2), -series.length);
    const prevRevenue = prev.reduce((acc, x) => acc + x.revenue, 0);
    const prevOrders = prev.reduce((acc, x) => acc + x.orders, 0);
    const prevCatering = prev.reduce((acc, x) => acc + x.catering, 0);
    const prevVenue = prev.reduce((acc, x) => acc + x.venue, 0);

    const pct = (curr, p) => (p ? Math.round(((curr - p) / p) * 100) : 0);

    return {
      revenue: { value: revenue, delta: pct(revenue, prevRevenue) },
      orders: { value: orders, delta: pct(orders, prevOrders) },
      catering: { value: catering, delta: pct(catering, prevCatering) },
      venue: { value: venue, delta: pct(venue, prevVenue) },
    };
  }, [series, series30]);

  const ordersByChannel = useMemo(() => {
    const base = Math.max(1, Math.round(totals.orders.value / 7));
    return [
      { channel: "Dine-in", orders: Math.round(base * 3.2) },
      { channel: "Take-out", orders: Math.round(base * 1.9) },
    ];
  }, [totals.orders.value]);

  const topItems = useMemo(
    () => [
      { item: "Chicken Inasal Plate", sold: 132, revenue: 132 * 159 },
      { item: "Beef Tapa Silog", sold: 108, revenue: 108 * 165 },
      { item: "Pancit Canton Bilao (Small)", sold: 39, revenue: 39 * 850 },
      { item: "Spaghetti Party Tray", sold: 27, revenue: 27 * 900 },
      { item: "Iced Tea Pitcher", sold: 96, revenue: 96 * 95 },
    ],
    []
  );

  const diningOrders = useMemo(
    () => [
      { no: "D-10441", type: "Dine-in", table: "T02", total: 980, status: "Preparing", time: "12:08 PM" },
      { no: "D-10440", type: "Take-out", table: "—", total: 520, status: "Confirmed", time: "11:56 AM" },
      { no: "D-10439", type: "Dine-in", table: "T10", total: 1460, status: "Confirmed", time: "11:44 AM" },
      { no: "D-10438", type: "Dine-in", table: "T07", total: 1280, status: "Preparing", time: "11:31 AM" },
      { no: "D-10437", type: "Take-out", table: "—", total: 690, status: "Confirmed", time: "11:18 AM" },
      { no: "D-10436", type: "Dine-in", table: "T03", total: 1550, status: "Served", time: "11:05 AM" },
      { no: "D-10435", type: "Dine-in", table: "T11", total: 780, status: "Served", time: "10:52 AM" },
      { no: "D-10434", type: "Take-out", table: "—", total: 430, status: "Served", time: "10:41 AM" },
      { no: "D-10433", type: "Dine-in", table: "T06", total: 1120, status: "Served", time: "10:28 AM" },
      { no: "D-10432", type: "Dine-in", table: "T01", total: 860, status: "Served", time: "10:12 AM" },
      { no: "D-10431", type: "Take-out", table: "—", total: 610, status: "Cancelled", time: "9:58 AM" },
      { no: "D-10430", type: "Dine-in", table: "T09", total: 1320, status: "Served", time: "9:43 AM" },
    ],
    []
  );

  const cateringAppointments = useMemo(
    () => [
      { client: "Garcia Family", event: "Birthday Lunch", date: "Apr 25", pax: 45, status: "Pending" },
      { client: "San Miguel Corp.", event: "Team Meeting Snacks", date: "Apr 27", pax: 80, status: "Confirmed" },
      { client: "Lopez & Co.", event: "Product Launch", date: "May 2", pax: 120, status: "Pending" },
      { client: "St. Anne School", event: "Recognition Day", date: "May 6", pax: 200, status: "Confirmed" },
      { client: "Villanueva Residence", event: "Christening Lunch", date: "May 9", pax: 55, status: "Pending" },
      { client: "Bautista Holdings", event: "Boardroom Merienda", date: "May 12", pax: 60, status: "Confirmed" },
      { client: "Reyes Family", event: "Family Reunion", date: "May 15", pax: 90, status: "Pending" },
      { client: "Barangay Council", event: "Community Meeting", date: "May 18", pax: 140, status: "Confirmed" },
      { client: "Del Rosario Clinic", event: "Anniversary Buffet", date: "May 22", pax: 75, status: "Pending" },
      { client: "Cruz Trading", event: "Client Appreciation", date: "May 26", pax: 110, status: "Confirmed" },
    ],
    []
  );

  const venueReservations = useMemo(
    () => [
      { event: "Wedding Reception", date: "May 3", time: "5:00 PM", package: "Venue + Buffet", status: "Pending" },
      { event: "Baptism Reception", date: "May 10", time: "11:00 AM", package: "Venue Only", status: "Confirmed" },
      { event: "Debut Celebration", date: "May 17", time: "6:00 PM", package: "Venue + Catering", status: "Pending" },
      { event: "Corporate Townhall", date: "May 20", time: "2:00 PM", package: "Venue Only", status: "Confirmed" },
      { event: "Graduation Party", date: "May 24", time: "4:00 PM", package: "Venue + Buffet", status: "Pending" },
      { event: "Company Anniversary", date: "May 28", time: "6:30 PM", package: "Venue + Catering", status: "Confirmed" },
      { event: "Baby Shower", date: "Jun 1", time: "1:00 PM", package: "Venue Only", status: "Pending" },
      { event: "Church Fellowship", date: "Jun 5", time: "10:00 AM", package: "Venue + Snacks", status: "Confirmed" },
    ],
    []
  );

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <Card className="relative overflow-hidden border-border/70">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_circle_at_20%_0%,hsl(var(--primary)/0.14),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_80%_10%,hsl(var(--primary)/0.10),transparent_60%)]" />
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Sandy's Kitchenette</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                  Quick overview of dining operations (dine-in & take-out), catering appointments, and venue reservations.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs">
                    <UtensilsCrossed className="h-3 w-3" />
                    Dining Operations
                  </Badge>
                  <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs">
                    <ChefHat className="h-3 w-3" />
                    Catering Appointments
                  </Badge>
                  <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs">
                    <Building2 className="h-3 w-3" />
                    Event Venue Reservations
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Select value={range} onValueChange={setRange}>
                  <SelectTrigger className="h-8 w-full bg-background/70 sm:w-[170px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="14d">Last 14 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="gap-2 bg-background/70">
                  <ClipboardList className="h-4 w-4" />
                  Export Summary
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <KPI
          title="Revenue"
          value={format.peso(totals.revenue.value)}
          delta={totals.revenue.delta}
          helper={`${series.length} days total`}
          icon={PhilippinePeso}
        />
        <KPI
          title="Dining Orders"
          value={totals.orders.value.toLocaleString()}
          delta={totals.orders.delta}
          helper="Dine-in + take-out"
          icon={UtensilsCrossed}
        />
        <KPI
          title="Catering Requests"
          value={totals.catering.value.toLocaleString()}
          delta={totals.catering.delta}
          helper="Inquiries / appointments"
          icon={ChefHat}
        />
        <KPI
          title="Venue Reservations"
          value={totals.venue.value.toLocaleString()}
          delta={totals.venue.delta}
          helper="Bookings / holds"
          icon={Building2}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Revenue Trend</CardTitle>
              <p className="text-muted-foreground text-xs">Daily revenue (mock data)</p>
            </div>
            <Badge variant="outline" className="gap-1 bg-background/70">
              <CalendarDays className="h-3 w-3" />
              {range === "7d" ? "7D" : range === "14d" ? "14D" : "30D"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              className="aspect-auto h-[240px] w-full"
              config={{
                revenue: { label: "Revenue", color: "#FF4F00" },
              }}
            >
              <AreaChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  fill="var(--color-revenue)"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Orders by Channel</CardTitle>
            <p className="text-muted-foreground text-xs">Dine-in vs take-out (mock data)</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              className="aspect-auto h-[240px] w-full"
              config={{
                orders: { label: "Orders", color: "#0ea5e9" },
              }}
            >
              <BarChart data={ordersByChannel} layout="vertical" margin={{ left: 20, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="channel" tickLine={false} axisLine={false} width={85} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Catering Requests</CardTitle>
              <p className="text-muted-foreground text-xs">Daily inquiries (mock data)</p>
            </div>
            <ChefHat className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              className="aspect-auto h-[220px] w-full"
              config={{
                catering: { label: "Requests", color: "#a855f7" },
              }}
            >
              <AreaChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={18} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="catering"
                  stroke="var(--color-catering)"
                  fill="var(--color-catering)"
                  fillOpacity={0.16}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Venue Reservations</CardTitle>
              <p className="text-muted-foreground text-xs">Daily bookings/holds (mock data)</p>
            </div>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              className="aspect-auto h-[220px] w-full"
              config={{
                venue: { label: "Reservations", color: "#22c55e" },
              }}
            >
              <AreaChart data={series} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={18} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="venue"
                  stroke="var(--color-venue)"
                  fill="var(--color-venue)"
                  fillOpacity={0.16}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Operations Feed</CardTitle>
            <p className="text-muted-foreground text-xs">Dining, catering, and venue snapshots (mock data)</p>
          </CardHeader>
          <CardContent className="pt-0 flex flex-1 flex-col">
            <Tabs defaultValue="dining" className="w-full flex flex-1 flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="dining" className="gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  Dining
                </TabsTrigger>
                <TabsTrigger value="catering" className="gap-2">
                  <ChefHat className="h-4 w-4" />
                  Catering
                </TabsTrigger>
                <TabsTrigger value="venue" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Venue
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dining" className="mt-3 flex-1">
                <div className="h-full min-h-[360px] overflow-auto rounded-md border lg:min-h-[520px]">
                  <Table>
		                  <TableHeader className="sticky top-0 z-10 bg-muted/70">
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diningOrders.map((o) => (
                        <TableRow key={o.no}>
                          <TableCell className="font-medium">{o.no}</TableCell>
                          <TableCell>{o.type}</TableCell>
                          <TableCell>{o.table}</TableCell>
                          <TableCell>{format.peso(o.total)}</TableCell>
                          <TableCell>
                            <StatusBadge status={o.status} />
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{o.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="catering" className="mt-3 flex-1">
                <div className="h-full min-h-[360px] overflow-auto rounded-md border lg:min-h-[520px]">
                  <Table>
		                  <TableHeader className="sticky top-0 z-10 bg-muted/70">
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Pax</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cateringAppointments.map((c, idx) => (
                        <TableRow key={`${c.client}-${idx}`}>
                          <TableCell className="font-medium">{c.client}</TableCell>
                          <TableCell>{c.event}</TableCell>
                          <TableCell className="text-muted-foreground">{c.date}</TableCell>
                          <TableCell>{c.pax}</TableCell>
                          <TableCell>
                            <StatusBadge status={c.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="venue" className="mt-3 flex-1">
                <div className="h-full min-h-[360px] overflow-auto rounded-md border lg:min-h-[520px]">
                  <Table>
		                  <TableHeader className="sticky top-0 z-10 bg-muted/70">
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {venueReservations.map((v, idx) => (
                        <TableRow key={`${v.event}-${idx}`}>
                          <TableCell className="font-medium">{v.event}</TableCell>
                          <TableCell className="text-muted-foreground">{v.date}</TableCell>
                          <TableCell className="text-muted-foreground">{v.time}</TableCell>
                          <TableCell>{v.package}</TableCell>
                          <TableCell>
                            <StatusBadge status={v.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

	        <Card className="lg:col-span-3">
	          <CardHeader className="pb-2">
	            <CardTitle className="text-base">Top Menu Items</CardTitle>
	            <p className="text-muted-foreground text-xs">Best sellers (mock data)</p>
	          </CardHeader>
	          <CardContent className="pt-0">
	            <div className="space-y-2">
	              {topItems.map((x) => (
		                <div key={x.item} className="space-y-1.5 rounded-lg border p-2.5 transition-shadow hover:shadow-sm">
	                  <div className="flex items-start justify-between gap-3">
	                    <div className="min-w-0">
	                      <p className="truncate text-sm font-medium">{x.item}</p>
                      <p className="text-muted-foreground text-xs">
                        {x.sold} sold • {format.peso(x.revenue)}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {x.sold}
                    </Badge>
                  </div>
                  <div className="bg-muted/70 h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.round((x.sold / topItems[0].sold) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

	            <Separator className="my-3" />

	            <div className="grid gap-2">
	              <Button size="sm" className="w-full justify-start gap-2" variant="outline">
	                <UtensilsCrossed className="h-4 w-4" />
	                Manage Dining Operations
	              </Button>
	              <Button size="sm" className="w-full justify-start gap-2" variant="outline">
	                <ChefHat className="h-4 w-4" />
	                Review Catering Requests
	              </Button>
	              <Button size="sm" className="w-full justify-start gap-2" variant="outline">
	                <Building2 className="h-4 w-4" />
	                View Venue Calendar
	              </Button>
	            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
