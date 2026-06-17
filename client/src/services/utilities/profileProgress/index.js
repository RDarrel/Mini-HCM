const profileProgress = auth => {
  const { address, dob, fullName, mobile, bio, verified } = auth;

  let valid = 0,
    requirements = [];

  const keys = {
    Street: {
      value: address.street,
      required: false,
    },
    Barangay: {
      value: address.barangay,
      required: false,
    },
    City: {
      value: address.city,
      required: true,
    },
    Province: {
      value: address.province,
      required: true,
    },
    Region: {
      value: address.region,
      required: true,
    },
    Birthdate: {
      value: dob,
      required: true,
    },
    "First name": {
      value: fullName.fname,
      required: true,
    },
    "Last name": {
      value: fullName.lname,
      required: true,
    },
    Biography: {
      value: bio,
      required: false,
    },
    "E-mail Verification": {
      value: verified,
      required: false,
    },
    Mobile: {
      value: mobile,
      required: true,
    },
  };

  const length = Object.keys(keys).length;

  for (const key in keys) {
    const item = keys[key];

    if (item.value) {
      valid++;
    }

    if (item.required && !item.value) {
      requirements.push(key);
    }
  }

  //63 is valid
  return {
    requirements,
    percentage: Math.floor((valid / length) * 100),
  };
};

export default profileProgress;
