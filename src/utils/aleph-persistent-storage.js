import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { importAccountFromPrivateKey } from '@aleph-sdk/ethereum';
import web3 from 'web3';

const MESSAGE = 'Reza';
const AGGREGATE_KEY = 'libertai-chat-ui';

export class AlephPersistentStorage {
  constructor(account) {
    this.account = account;
  }

  static async initialize(signer) {
    const hash = await signer.signMessage(MESSAGE);
    const privateKey = web3.utils.sha3(hash);
    const account = importAccountFromPrivateKey(privateKey);

    return new AlephPersistentStorage(account);
  }

  async save(content) {
    const client = new AuthenticatedAlephHttpClient(this.account);
    const message = await client.createAggregate({
      key: AGGREGATE_KEY,
      content,
    });
    console.log(`Saved on Aleph with hash ${message.item_hash}`);
  }
}
