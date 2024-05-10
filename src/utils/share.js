import { Publish, Get } from 'aleph-sdk-ts/dist/messages/store';

const API_SERVER = 'https://api2.aleph.im';
const CHANNEL = 'libertai';
const STORAGE_ENGINE = 'ipfs';

export async function addJsonToAleph(json, account) {
  // Creat a file object from the json
  const blob = new Blob([JSON.stringify(json)], { type: 'text/plain' });

  const storeMessage = await Publish({
    APIServer: API_SERVER,
    channel: CHANNEL,
    storageEngine: STORAGE_ENGINE,
    account,
    fileObject: blob,
  });

  return storeMessage.content.item_hash;
}

export async function getJsonFromAleph(itemHash) {
  let data = await Get({
    APIServer: API_SERVER,
    fileHash: itemHash,
  });
  return JSON.parse(Buffer.from(data).toString('utf-8'));
}
