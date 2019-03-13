/**
 * Save an item to localStorage.
 *
 * @param {string} key - Name to store the item as.
 * @param {*} value - Item to store.
 */
export function setStoreItem(key, value) {
  if (value === undefined) {
    localStorage.removeItem(key);
  }
  else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Retrieve an item from localStorage and convert it back to it's original type.
 *
 * @param {string} key - Name of the item.
 *
 * @returns {*}
 */
export function getStoreItem(key) {
  let value = localStorage.getItem(key);

  try {
    value = JSON.parse(value);
  }
  catch(e) {}

  return value;
}