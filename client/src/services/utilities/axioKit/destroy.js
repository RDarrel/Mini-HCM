import axios from "axios";
/**
 * Destroy function.
 *
 * @param {string} entity - Base route of the API.
 * @param {Array<any>|object} data - Information that will be stored in the database.
 * @param {string} token - Authorization Token.
 * @returns {{ success: boolean, payload: Array<any>|object }} - The result object containing success and payload.
 */
const destroy = async (entity, data, token) => {
  try {
    const response = await axios.delete(`${entity}/destroy`, {
      headers: {
        Authorization: `QTracy ${token}`,
      },
      data,
    });
    return response.data;
  } catch (error) {
    const { response } = error;
    const { error: errorMessage, message } = response.data;
    throw new Error(message ? `${errorMessage}: ${message}` : errorMessage);
  }
};

export default destroy;
