import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { ETHAccount, getAccountFromProvider, importAccountFromPrivateKey } from '@aleph-sdk/ethereum';
import web3 from 'web3';
import { ItemType } from '@aleph-sdk/message';

const MESSAGE = 'LibertAI';
const AGGREGATE_KEY = 'libertai-chat-ui';
const SECURITY_AGGREGATE_KEY = 'security';

export class AlephPersistentStorage {
  constructor(
    private account: ETHAccount,
    private subAccountClient: AuthenticatedAlephHttpClient,
  ) {}

  static async initialize(signer: any) {
    const hash = await signer.signMessage(MESSAGE);
    const privateKey = web3.utils.sha3(hash);

    if (privateKey === undefined) {
      console.error('Private key generation failed');
      return undefined;
    }
    const subAccount = importAccountFromPrivateKey(privateKey);
    // @ts-expect-error
    const account = await getAccountFromProvider(window.ethereum);
    const accountClient = new AuthenticatedAlephHttpClient(account);
    const subAccountClient = new AuthenticatedAlephHttpClient(subAccount);

    await AlephPersistentStorage.getSecurityPermission(account, subAccount, accountClient);

    return new AlephPersistentStorage(account, subAccountClient);
  }

  static async getSecurityPermission(
    account: ETHAccount,
    subAccount: ETHAccount,
    accountClient: AuthenticatedAlephHttpClient,
  ) {
    try {
      // TODO: Add zod parsing
      const securitySettings = (await accountClient.fetchAggregate(account.address, SECURITY_AGGREGATE_KEY)) as any;

      if (
        !securitySettings.authorizations.find(
          (authorization: any) =>
            authorization.address === subAccount.address &&
            authorization.types.includes('AGGREGATE') &&
            authorization.aggregate_keys.includes(AGGREGATE_KEY),
        )
      ) {
        await accountClient.createAggregate({
          key: SECURITY_AGGREGATE_KEY,
          content: {
            authorizations: [
              ...securitySettings.authorizations,
              {
                address: subAccount.address,
                types: ['AGGREGATE'],
                aggregate_keys: [AGGREGATE_KEY],
              },
            ],
          },
        });
      }
    } catch (error) {
      // Security aggregate does not exist or with invalid content, creating a new one
      await accountClient.createAggregate({
        key: SECURITY_AGGREGATE_KEY,
        content: {
          authorizations: [
            {
              address: subAccount.address,
              types: ['AGGREGATE'],
              aggregate_keys: [AGGREGATE_KEY],
            },
          ],
        },
      });
    }
  }

  async save(content: object) {
    try {
      const message = await this.subAccountClient.createAggregate({
        key: AGGREGATE_KEY,
        content,
        address: this.account.address,
      });
      console.log(`Data saved on Aleph with hash ${message.item_hash}`);
    } catch (error) {
      console.error(`Saving data on Aleph failed: ${error}`);
    }
  }

  async fetch() {
    try {
      const settings = await this.subAccountClient.fetchAggregate(this.account.address, AGGREGATE_KEY);
      return settings;
    } catch (error) {
      console.error(`Fetching settings from Aleph failed: ${error}`);
      return undefined;
    }
  }

  async uploadFile(file: File) {
    const message = await this.subAccountClient.createStore({ fileObject: file, storageEngine: ItemType.ipfs });
    return message;
  }
}
