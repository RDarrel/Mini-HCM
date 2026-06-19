const Punch = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Employee Dashboard</CardTitle>
            <CardDescription>{formatFullDate(now)}</CardDescription>
          </div>

          <InlineMetric icon={Clock3} label="Time" value={formatClock(now)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoPanel
              icon={CalendarClock}
              label="Assigned Schedule"
              value={shiftLabel}
            />
            <InfoPanel
              icon={Timer}
              label="Hours Logged"
              value={Formatter.duration(workedMinutes)}
            />
            <InfoPanel label="Attendance Status" value={statusLabel} />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            <Button
              size="lg"
              disabled={isSubmitting || Boolean(todayRecord?.timeIn)}
              onClick={() => handlePunch("in")}
            >
              <ArrowDownToLine />
              Punch In
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={isSubmitting || !isPunchedIn}
              onClick={() => handlePunch("out")}
            >
              <ArrowUpFromLine />
              Punch Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Punch;
