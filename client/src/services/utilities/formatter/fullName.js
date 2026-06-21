import capitalize from "./capitalize";
const fullName = (fullname) => {
  if (typeof fullname !== "object") return "Datatype mismatch";

  if (fullname.fname) {
    const { fname, mname, lname, suffix } = fullname;
    let middleName = "";

    if (mname) {
      middleName = `${mname
        .split(" ")
        .map((middle) => middle.charAt(0).toUpperCase())
        .join("")}.`;
    }

    const fullName = `${lname}, ${fname} ${middleName} ${
      suffix ? `(${suffix})` : ""
    }`.replace(/^\s+|\s+$/gm, "");

    return capitalize(fullName);
  }

  return "Incomplete";
};

export default fullName;
