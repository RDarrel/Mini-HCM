import axios from "axios";
import { getAuth } from "firebase/auth";

/**
 * A universal GET request.
 *
 * @param {string} entity - Base route of the API.
 * @param {string} token - Authorization Token.
 * @param {string|object} key - Headers that will be passed to the api.
 * @returns {{ success: boolean, payload: Array<any>|object }} - The result object containing success and payload.
 */

const universal = async (name, key = "") => {
  let queryString = "";
  const token = await getAuth().currentUser.getIdToken();

  if (typeof key === "object") {
    Object.keys(key).forEach((i) => {
      const value = Array.isArray(key[i]) ? JSON.stringify(key[i]) : key[i];
      queryString += `${encodeURIComponent(i)}=${encodeURIComponent(value)}&`;
    });
    queryString = `?${queryString.slice(0, -1)}`;
  }

  try {
    const response = await axios.get(`${name}${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const { data } = error.response;
      const errorMessage = data.message
        ? `${data.error}: ${data.message}`
        : data.error;
      throw new Error(errorMessage);
    } else {
      throw error;
    }
  }
};

export default universal;
