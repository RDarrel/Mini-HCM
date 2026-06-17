const formatMobile = (contacts) => {
  if (!contacts) return "-";

  let num = contacts.trim();

  // Check if already formatted (e.g. 0919-555-1122 or +63 919-555-1122)
  const formattedPattern = /^(\+63|0)\d{3}-\d{3}-\d{4}$/;
  if (formattedPattern.test(num)) {
    // If already starts with +63, return as is
    if (num.startsWith("+63")) return num;

    // If starts with 0, replace with +63 prefix
    if (num.startsWith("0")) {
      return "+63 " + num.slice(1);
    }

    return num;
  }

  // Remove all non-numeric characters
  let digits = num.replace(/\D/g, "");

  // Remove country code if present (63)
  if (digits.startsWith("63")) {
    digits = digits.slice(2);
  }

  // Remove leading zero
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Validate if number is correct length
  if (digits.length !== 10) return contacts;

  // Format to +63 919-555-1122
  return `+63 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export default formatMobile;
