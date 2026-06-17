import { useState } from "react";

const useLocalStorage = (key, initialValue) => {
  /* pang kuha ng value sa localStorage */
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error parsing localStorage item", error);
      return initialValue;
    }
  });

  /* pang set sa localStorage */
  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error setting localStorage item", error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
