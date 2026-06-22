import Daily from "./daily";
import Weekly from "./weekly";
const Filters = ({
  dailyDate,
  reportType,
  setDailyDate,
  setWeeklyRange,
  weeklyRange,
}) => {
  const filterMap = {
    daily: Daily,
    weekly: Weekly,
  };

  const NotFound = () => <div>Please select a valid report type</div>;

  const Filter = filterMap[reportType] || NotFound;

  return (
    <Filter
      date={dailyDate}
      setDate={setDailyDate}
      setWeeklyRange={setWeeklyRange}
      weeklyRange={weeklyRange}
    />
  );
};

export default Filters;
