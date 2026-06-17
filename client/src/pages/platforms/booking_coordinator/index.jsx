import { useSelector } from "react-redux";

const BookingCoordinator = () => {
  const { auth } = useSelector(({ auth }) => auth);

  return <div>Booking Coordinator</div>;
};

export default BookingCoordinator;
