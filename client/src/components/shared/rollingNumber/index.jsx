import React, { useState, useEffect } from "react";

const RollingNumber = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = null;
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(startValue + diff * progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);
  const formattedValue = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }); // decimal → may 2 digits

  return <h2 className="text-5xl digital-text">{formattedValue}</h2>;
};

export default RollingNumber;
