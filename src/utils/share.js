import { Publish, Get } from 'aleph-sdk-ts/dist/messages/store';

const CHANNEL = 'libertai';

export async function addJsonToAleph(json, account) {
  // Creat a file object from the json
  const blob = new Blob([JSON.stringify(json)], { type: 'text/plain' });

  console.log('blob', blob);

  const storeMessage = await Publish({
    channel: CHANNEL,
    account,
    fileObject: blob,
  });

  console.log('store_message', storeMessage);

  return storeMessage.content.item_hash;
}

export async function getJsonFromAleph(itemHash) {
  let data = await Get({ fileHash: itemHash });
  console.log('data', data);
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(data.content);
  console.log('jsonString', jsonString);
  const json = JSON.parse(jsonString);
  console.log('json', json);
  return json;
}
