import localforage from "localforage";

/**
 * Create a new localforage instance with the given name
 * @param {string} name - The name of the store
 * @returns {LocalForage}
 */
export function createStore(name) {
  return localforage.createInstance({ name });
}

/**
 * Put an item in the store
 * @param {string} id - The id of the item
 * @param {any} item - The item to store
 * @param {LocalForage} store - The store to put the item in
 * @returns {Promise<any>} - The item stored
 */
export async function put(id, item, store) {
  return store.setItem(id, item);
}

/**
 * Get an item from the store
 * @param {string} id - The id of the item
 * @param {LocalForage} store - The store to get the item from
 * @returns {Promise<any | null>} - The item or null if it doesn't exist
 */
export async function get(id, store) {
  const item = await store.getItem(id);
  // Check if item is null
  if (item === null) {
    return null;
  }
  return item;
}

/**
 * Check if an item exists in the store
 * @param {string} id - The id of the item
 * @param {LocalForage} store - The store to check
 * @returns {Promise<boolean>} - True if the item exists, false otherwise
 */
export async function exists(id, store) {
  const key = await store.getItem(id);
  return key !== null;
}

/**
 * Remove an item from the store
 * @param {string} id - The id of the item to remove
 * @param {LocalForage} store - The store to remove the item from
 * @returns {Promise<void>}
 */
export async function rm(id, store) {
  return store.removeItem(id);
}

/**
 * Drop the store
 * @param {LocalForage} store - The store to drop
 * @returns {Promise<void>}
 */
export async function dropStore(store) {
  return store.dropInstance();
}

/**
 * Clear all items in the store
 * @param {LocalForage} store - The store to clear
 * @returns {Promise<void>}
 */
export async function clear(store = null) {
  if (store) {
    return dropStore(store);
  } else {
    return localforage.clear();
  }
}

export default {
  createStore,
  get,
  put,
  exists,
  rm,
  dropStore,
  clear,
};
