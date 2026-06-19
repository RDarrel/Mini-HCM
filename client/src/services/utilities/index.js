import axioKit from "./axioKit";
import handlePagination from "./pagination";
import getTimezone from "./timezone";
import Male from "../../assets/male.jpg";
import Female from "../../assets/female.jpg";
import globalSearch from "./globalSearch";
import Formatter from "./formatter";
const ENDPOINT = "http://localhost:5000";
//use this to if the system is deployed
// const ENDPOINT = window.location.origin;

const PresetImage = (gender) => {
  if (gender) return Male;

  return Female;
};

export {
  Formatter,
  ENDPOINT,
  axioKit,
  getTimezone,
  PresetImage,
  handlePagination,
  globalSearch,
};
