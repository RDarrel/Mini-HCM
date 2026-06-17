const amount = (value) => {
  if (!value && value !== 0) return "₱0";

  const num = Number(value);

  return `₱${num.toLocaleString(undefined, {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export default amount;
