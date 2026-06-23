import axioKit from "./axioKit";
import Male from "../assets/male.jpg";
import Female from "../assets/female.jpg";
import Formatter from "./formatter";
import { toISODate, getTimezone } from "./date";
const ENDPOINT = "http://localhost:5000";
//use this to if the system is deployed
// const ENDPOINT = window.location.origin;

const PresetImage = (gender) => {
  if (gender) return Male;

  return Female;
};

export { Formatter, ENDPOINT, axioKit, getTimezone, toISODate, PresetImage };
