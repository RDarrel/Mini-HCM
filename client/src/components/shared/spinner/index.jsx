import { Loader } from "lucide-react";
import React from "react";

const Spinner = ({ formSubmitted = false }) => {
  if (!formSubmitted) {
    return null;
  }
  return <Loader className="animate-spin" />;
};

export default Spinner;
