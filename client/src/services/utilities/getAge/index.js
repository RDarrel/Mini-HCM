const getAge = (dob, useNumber = false) => {
  if (!dob) return useNumber ? 0 : "-";

  var ageInMilliseconds = new Date() - new Date(dob);
  const years = Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365),
    months = Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 30),
    days = Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24);

  if (useNumber) return Number(years);

  if (years === 0) {
    if (months === 0) return `${days} days`;

    return `${months} months`;
  }

  return `${years} y/o`;
};

export default getAge;
