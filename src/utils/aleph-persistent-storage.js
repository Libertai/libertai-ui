import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { importAccountFromPrivateKey } from '@aleph-sdk/ethereum';
import web3 from 'web3';

const MESSAGE = 'LibertAi';
const AGGREGATE_KEY = 'libertai-chat-ui';

export class AlephPersistentStorage {
  constructor(account) {
    this.account = account;
    this.client = new AuthenticatedAlephHttpClient(this.account);
  }

  static async initialize(signer) {
    const hash = await signer.signMessage(MESSAGE);
    const privateKey = web3.utils.sha3(hash);
    const account = importAccountFromPrivateKey(privateKey);

    return new AlephPersistentStorage(account);
  }

  async save(content) {
    const message = await this.client.createAggregate({
      key: AGGREGATE_KEY,
      content,
    });
    console.log(`Data saved on Aleph with hash ${message.item_hash}`);
  }

  async fetch() {
    try {
      const settings = await this.client.fetchAggregate(this.account.address, AGGREGATE_KEY);
      return settings;
    } catch (error) {
      console.error(`Fetching settings from Aleph failed: ${error}`);
      return undefined;
    }
  }
}
