import collections from "./collections.json";

const Role = {
  collections: collections.filter(({ id }) => id !== 1),
  getLabel: (role) => {
    return (
      collections.find(({ id }) => id === Number(role))?.label || "Unknown Role"
    );
  },
};

export default Role;
