import axios from "axios";
import { getAuth } from "firebase/auth";

/**
 * Save function.
 *
 * @param {string} entity - Base route of the API.
 * @param {object} data - Information that will be stored in the database.
 * @returns {{ success: boolean, payload: object }} - The result object containing success and payload.
 */
const save = async (entity, data, action = "save") => {
  const token = await getAuth().currentUser.getIdToken();
  return await axios
    .post(`${entity}/${action}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data)
    .catch(({ response }) => {
      const { error, message } = response.data;
      throw new Error(message ? `${error}: ${message}` : error);
    });
};

export default save;
