const fullAddress = (address, isComplete = true) => {
  if (isComplete) {
    return `${address.region}, ${address.province}, ${address.city} ${
      address.barangay && `, ${address.barangay}`
    } ${address.street && `, ${address.street}`}`.replace(/^\s+|\s+$/gm, "");
  } else {
    return `${address.region}, ${address.province}`;
  }
};

export default fullAddress;
