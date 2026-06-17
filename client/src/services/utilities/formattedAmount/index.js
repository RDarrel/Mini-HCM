const formattedAmount = (amount) =>
  amount
    ? amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

export default formattedAmount;
