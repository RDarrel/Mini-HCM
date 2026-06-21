import { Loader } from "lucide-react";
import React from "react";

const Spinner = ({ isLoading = false }) => {
  if (!isLoading) {
    return null;
  }
  return <Loader className="animate-spin" />;
};

export default Spinner;
