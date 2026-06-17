import collections from "./collections.json";
const Category = {
  collections,
  getName: (value) => collections.find((e) => e.value === value)?.name || "",
};
export default Category;
