import { useState, useEffect, useCallback } from "react";

const useCountdown = targetDate => {
  const calculateTimeLeft = useCallback(() => {
    const currentTime = new Date().getTime();
    const difference = targetDate - currentTime;
    const isPastDate = difference < 0;

    const days = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((Math.abs(difference) / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((Math.abs(difference) / (1000 * 60)) % 60);
    const seconds = Math.floor((Math.abs(difference) / 1000) % 60);

    return {
      days: isPastDate ? -days : days,
      hours,
      minutes,
      seconds,
      isPastDate,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
};

export default useCountdown;
