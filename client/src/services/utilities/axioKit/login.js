import axios from "axios";

/**
 * Login function.
 *
 * @param {string} email - E-mail Address used for authentication.
 * @param {string} password - Password used for authentication.
 * @returns {{ success: boolean, payload: object }} - The result object containing success and payload.
 */
const login = async (email, password) =>
  await axios
    .get(`persons/auth/login?email=${email}&password=${password}`)
    .then(({ data }) => {
      const { payload } = data;
      localStorage.setItem("token", payload.token);
      localStorage.setItem("email", payload.user.email);
      return data;
    })
    .catch(({ response }) => {
      const { error, message } = response.data;
      throw new Error(message ? `${error}: ${message}` : error);
    });

export default login;
