import axios from "axios";
/**
 * Update function.
 *
 * @param {string} entity - Base route of the API.
 * @param {Array<any>|object} data - Information that will be stored in the database.
 * @param {string} token - Authorization Token.
 * @returns {{ success: boolean, payload: Array<any>|object }} - The result object containing success and payload.
 */
const update = async (entity, data, token, endpoint) =>
  await axios
    .put(`${entity}/${endpoint ? endpoint : "update"}`, data, {
      headers: {
        Authorization: `QTracy ${token}`,
      },
    })
    .then(({ data }) => data)
    .catch(({ response }) => {
      const { error, message } = response.data;
      throw new Error(message ? `${error}: ${message}` : error);
    });

export default update;
