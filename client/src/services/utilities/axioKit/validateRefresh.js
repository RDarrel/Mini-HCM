import axios from "axios";

/**
 * Validation of token on refresh.
 *
 * @param {string} token - Authorization Token.
 * @returns {{ success: boolean, payload: Array<any>|object }} - The result object containing success and payload.
 */
const validateRefresh = async (token) =>
  await axios
    .get(`persons/auth/validateRefresh`, {
      headers: {
        Authorization: `QTracy ${token}`,
      },
    })
    .then(({ data }) => data)
    .catch(({ response }) => {
      const { error, message } = response.data;
      throw new Error(message ? `${error}: ${message}` : error);
    });

export default validateRefresh;
