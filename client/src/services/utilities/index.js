import io from "socket.io-client";
import axioKit from "./axioKit";
import handlePagination from "./pagination";
import Male from "../../assets/male.jpg";
import Female from "../../assets/female.jpg";
import globalSearch from "./globalSearch";
import Formatter from "./formatter";
const ENDPOINT = "http://localhost:5000";
const ENCRYPTION_KEY = "601b422c2548c7598feff2332a8e6eee9";
//use this to if the system is deployed
// const ENDPOINT = window.location.origin;
const socket = io.connect(ENDPOINT);

const PresetImage = (gender) => {
  if (gender) return Male;

  return Female;
};

export {
  ENCRYPTION_KEY,
  Formatter,
  ENDPOINT,
  axioKit,
  socket,
  PresetImage,
  handlePagination,
  globalSearch,
};
