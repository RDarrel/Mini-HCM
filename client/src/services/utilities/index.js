import io from "socket.io-client";
import axioKit from "./axioKit";
import handlePagination from "./pagination";
import fullName from "./fullName";
import calculateDiff from "./calculateDiff";
import Male from "../../assets/male.jpg";
import Female from "../../assets/female.jpg";
import formattedDate from "./formattedDate";
import isJpegOrJpgFile from "./isJpegOrJpgFile";
import fullAddress from "./fullAddress";
import bulkPayload from "./bulkPayload";
import globalSearch from "./globalSearch";
import useCountdown from "./useCountdown";
import getAge from "./getAge";
import truncateString from "./truncateString";
import formattedTime from "./formattedTime";
import formattedAmount from "./formattedAmount";
import Formatter from "./formatter";
import format from "./format";
import mobile from "./mobile";
import capitalize from "./capitalize";
import Stock from "./stock";
import Inventory from "./inventory";
import isShortageResolved from "./isShortageResolved";
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
  Stock,
  Inventory,
  Formatter,
  capitalize,
  ENDPOINT,
  axioKit,
  socket,
  format,
  isShortageResolved,
  mobile,
  formattedAmount,
  formattedTime,
  PresetImage,
  truncateString,
  getAge,
  formattedDate,
  handlePagination,
  fullName,
  calculateDiff,
  isJpegOrJpgFile,
  fullAddress,
  bulkPayload,
  globalSearch,
  useCountdown,
};
