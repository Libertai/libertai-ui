import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { ETHAccount, getAccountFromProvider, importAccountFromPrivateKey } from '@aleph-sdk/ethereum';
import web3 from 'web3';
import { ItemType } from '@aleph-sdk/message';
import { signMessage } from '@wagmi/core';
import { config } from 'src/config/wagmi';
import { SignMessageReturnType } from 'viem';
import { knowledgeAlephStorage, KnowledgeBase } from 'src/types/knowledge';

// Aleph keys and channels
const SECURITY_AGGREGATE_KEY = 'security';
const MESSAGE = 'LibertAI';
const LIBERTAI_CHANNEL = 'libertai-chat-ui';
const LIBERTAI_SETTINGS_KEY = `${LIBERTAI_CHANNEL}-settings`;
const LIBERTAI_KNOWLEDGE_BASE_KEY = `${LIBERTAI_CHANNEL}-knowledge-base-test-0`;

export class AlephPersistentStorage {
  constructor(
    /* eslint-disable-next-line no-unused-vars */
    private account: ETHAccount,
    /* eslint-disable-next-line no-unused-vars */
    private subAccountClient: AuthenticatedAlephHttpClient,
  ) {}

  static async signBaseMessage() {
    return signMessage(config, { message: MESSAGE });
  }

  static async initialize(hash: SignMessageReturnType) {
    const privateKey = web3.utils.sha3(hash);

    if (privateKey === undefined) {
      console.error('Private key generation failed');
      return undefined;
    }
    const subAccount = importAccountFromPrivateKey(privateKey);
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

      type SecurityAuthorization = {
        address: string;
        chain?: string;
        channels?: string;
        types?: string;
        post_types?: string;
        aggregate_keys?: string;
      };

      if (
        !securitySettings.authorizations.find(
          (authorization: SecurityAuthorization) =>
            authorization.address === subAccount.address &&
            authorization.types === undefined &&
            authorization.channels !== undefined &&
            authorization.channels.includes(LIBERTAI_CHANNEL),
        )
      ) {
        const oldAuthorizations = securitySettings.authorizations.filter(
          (a: SecurityAuthorization) => a.address !== subAccount.address,
        );

        await accountClient.createAggregate({
          key: SECURITY_AGGREGATE_KEY,
          content: {
            authorizations: [
              ...oldAuthorizations,
              {
                address: subAccount.address,
                channels: [LIBERTAI_CHANNEL],
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
              channels: [LIBERTAI_CHANNEL],
            },
          ],
        },
      });
    }
  }

  async saveSettings(content: object) {
    try {
      const message = await this.subAccountClient.createAggregate({
        key: LIBERTAI_SETTINGS_KEY,
        content,
        address: this.account.address,
        channel: LIBERTAI_CHANNEL,
      });
      console.log(`Settings saved on Aleph with hash ${message.item_hash}`);
    } catch (error) {
      console.error(`Saving settings on Aleph failed: ${error}`);
    }
  }

  async fetchSettings() {
    try {
      const settings = await this.subAccountClient.fetchAggregate(this.account.address, LIBERTAI_SETTINGS_KEY);
      return settings;
    } catch (error) {
      console.error(`Fetching settings from Aleph failed: ${error}`);
      return undefined;
    }
  }

  async uploadFile(file: File) {
    const message = await this.subAccountClient.createStore({
      fileObject: file,
      storageEngine: ItemType.ipfs,
      channel: LIBERTAI_CHANNEL,
    });
    return message;
  }

  async fetchKnowledgeBases(): Promise<KnowledgeBase[] | undefined> {
    try {
      const response = await this.subAccountClient.fetchAggregate(this.account.address, LIBERTAI_KNOWLEDGE_BASE_KEY);

      const parsedKnowledgeBases = knowledgeAlephStorage.safeParse(response);
      if (!parsedKnowledgeBases.success) {
        throw new Error(`Zod parsing failed: ${parsedKnowledgeBases.error}`);
      }

      return parsedKnowledgeBases.data.data;
    } catch (error) {
      console.error(`Fetching Knowledge bases from Aleph failed: ${error}`);
      return undefined;
    }
  }

  async saveKnowledgeBases(knowledgeBases: KnowledgeBase[]) {
    try {
      const message = await this.subAccountClient.createAggregate({
        key: LIBERTAI_KNOWLEDGE_BASE_KEY,
        content: {
          data: knowledgeBases,
        },
        address: this.account.address,
        channel: LIBERTAI_CHANNEL,
      });
      console.log(`Knowledge bases saved on Aleph with hash ${message.item_hash}`);
    } catch (error) {
      console.error(`Saving knowledge bases on Aleph failed: ${error}`);
    }
  }
}
