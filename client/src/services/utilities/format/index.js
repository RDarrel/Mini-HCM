const format = {
  peso: (amount) => {
    if (!amount) return "₱0.00";
    return `₱${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },
  liters: (amount, srp = 0) => {
    const liters = Number(amount / srp);
    return Number.isInteger(liters) ? liters : liters.toFixed(2);
  },
};

export default format;
