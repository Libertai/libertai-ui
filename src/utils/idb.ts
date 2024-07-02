import localforage from 'localforage';

export function createStore(name: string): LocalForage {
  return localforage.createInstance({ name });
}

export async function put(id: string, item: any, store: LocalForage): Promise<any> {
  return store.setItem(id, item);
}

export async function get(id: string, store: LocalForage): Promise<any> {
  const item = await store.getItem(id);
  // Check if item is null
  if (item === null) {
    return null;
  }
  return item;
}

export async function exists(id: string, store: LocalForage): Promise<boolean> {
  const key = await store.getItem(id);
  return key !== null;
}

export async function rm(id: string, store: LocalForage) {
  return store.removeItem(id);
}

export async function dropStore(store: LocalForage) {
  return store.dropInstance();
}

export async function clear(store: LocalForage | null = null) {
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
