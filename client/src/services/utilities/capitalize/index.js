const capitalize = (string) => {
  if (!string && string !== 0) return "-"; // covers null, undefined, ''
  if (typeof string === "number") return string;

  return String(string)
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default capitalize;
