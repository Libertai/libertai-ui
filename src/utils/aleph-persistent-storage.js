import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { importAccountFromPrivateKey } from '@aleph-sdk/ethereum';

const MESSAGE = 'Reza';

export class AlephPersistentStorage {
  constructor(account) {
    console.log('account: ', account.address);
    this.account = account;
  }

  static async initialize(signer) {
    const hash = await signer.signMessage(MESSAGE);
    const account = importAccountFromPrivateKey(hash);

    return new AlephPersistentStorage(account);
  }

  async save(_content) {
    console.log('Posting message');
    const client = new AuthenticatedAlephHttpClient(this.account);
    const message = await client.createAggregate({
      key: 'libertai-chat-ui',
      content: { bio: 'tester', name: 'Moshe on Ethereum' },
    });
    console.log('Message posted');
    console.log(message.content);
  }
}
