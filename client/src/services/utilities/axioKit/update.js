import axios from "axios";
import { getAuth } from "firebase/auth";

/**
 * Update function.
 *
 * @param {string} entity - Base route of the API.
 * @param {Array<any>|object} data - Information that will be stored in the database.
 * @returns {{ success: boolean, payload: Array<any>|object }} - The result object containing success and payload.
 */
const update = async (entity, data, action = "update") => {
  const token = await getAuth().currentUser.getIdToken();

  return await axios
    .put(`${entity}/${action}`, data, {
      headers: {
        Authorization: `QTracy ${token}`,
      },
    })
    .then(({ data }) => data)
    .catch(({ response }) => {
      const { error, message } = response.data;
      throw new Error(message ? `${error}: ${message}` : error);
    });
};

export default update;
