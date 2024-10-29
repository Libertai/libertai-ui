import type { Account, Chain, Client, Transport } from 'viem';

import {
  BaseAccount,
  getAccountFromProvider as getBaseAccountFromProvider,
  importAccountFromPrivateKey as importBaseAccountFromPrivateKey,
} from '@aleph-sdk/base';
import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';
import { ItemType } from '@aleph-sdk/message';
import { getAccountFromProvider as getSolAccountFromProvider, SOLAccount } from '@aleph-sdk/solana';
import {
  type Config,
  getConnections,
  getConnectorClient,
  signMessage as signWagmiMessage,
  switchChain,
} from '@wagmi/core';
import { base } from '@wagmi/vue/chains';
import { PrivateKey } from 'eciesjs';
import { providers } from 'ethers';
import { useWallet } from 'solana-wallets-vue';
import env from 'src/config/env';
import { config } from 'src/config/wagmi';
import {
  KnowledgeBase,
  KnowledgeBaseIdentifier,
  knowledgeBaseIdentifiersAlephStorage,
  knowledgeSchema,
} from 'src/types/knowledge';
import { decrypt, encrypt, generateIv, generateKey } from 'src/utils/encryption';
import { decryptKnowledgeBaseIdentifiers, encryptKnowledgeBaseIdentifiers } from 'src/utils/knowledge/encryption';
import { AccountChain } from 'stores/account';
import web3 from 'web3';

// Aleph keys and channels settings
const SECURITY_AGGREGATE_KEY = 'security';
const MESSAGE = 'LibertAI';
const LIBERTAI_GENERAL_CHANNEL = 'libertai';
const LIBERTAI_UI_CHANNEL = 'libertai-chat-ui';
const LIBERTAI_SETTINGS_KEY = `${LIBERTAI_UI_CHANNEL}-settings`;
const LIBERTAI_KNOWLEDGE_BASE_IDENTIFIERS_KEY = `${LIBERTAI_GENERAL_CHANNEL}-knowledge-base-identifiers`;
const LIBERTAI_KNOWLEDGE_BASE_POST_TYPE = `${LIBERTAI_GENERAL_CHANNEL}-knowledge-base`;

export function clientToProvider(client: Client<Transport, Chain, Account>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new providers.Web3Provider(transport, network);
}

/** Action to convert a Viem Client to an ethers.js Web3Provider. */
export async function getEthersProvider(config: Config, { chainId }: { chainId?: number } = { chainId: base.id }) {
  const client = await getConnectorClient(config, { chainId });
  return clientToProvider(client);
}

export class AlephPersistentStorage {
  constructor(
    /* eslint-disable-next-line no-unused-vars */
    private account: BaseAccount | SOLAccount,
    /* eslint-disable-next-line no-unused-vars */
    private subAccountClient: AuthenticatedAlephHttpClient,
    // eslint-disable-next-line no-unused-vars
    private encryptionPrivateKey: PrivateKey,
  ) {}

  static async signMessage(chain: AccountChain): Promise<`0x${string}` | string> {
    switch (chain) {
      case 'base':
        return signWagmiMessage(config, { message: MESSAGE });
      case 'solana':
        const { signMessage: signSolanaMessage } = useWallet();
        const signature = await signSolanaMessage.value!(Buffer.from(MESSAGE));
        return Buffer.from(signature).toString('base64');
    }
  }

  static async initialize(hash: string, chain: AccountChain) {
    const privateKey = web3.utils.sha3(hash);

    if (privateKey === undefined) {
      console.error('Private key generation failed');
      return undefined;
    }
    const encryptionPrivateKey = PrivateKey.fromHex(privateKey);

    const subAccount = importBaseAccountFromPrivateKey(privateKey);

    const account = await this.getAlephAccount(chain);

    const accountClient = new AuthenticatedAlephHttpClient(account, env.ALEPH_API_URL);
    const subAccountClient = new AuthenticatedAlephHttpClient(subAccount, env.ALEPH_API_URL);

    await AlephPersistentStorage.getSecurityPermission(account, subAccount, accountClient);

    return new AlephPersistentStorage(account, subAccountClient, encryptionPrivateKey);
  }

  static async getSecurityPermission(
    account: BaseAccount | SOLAccount,
    subAccount: BaseAccount,
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
            authorization.channels?.includes(LIBERTAI_GENERAL_CHANNEL) &&
            authorization.channels?.includes(LIBERTAI_UI_CHANNEL),
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
                channels: [LIBERTAI_GENERAL_CHANNEL, LIBERTAI_UI_CHANNEL],
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
              channels: [LIBERTAI_GENERAL_CHANNEL, LIBERTAI_UI_CHANNEL],
            },
          ],
        },
      });
    }
  }

  private static async getAlephAccount(chain: AccountChain): Promise<BaseAccount | SOLAccount> {
    if (chain === 'base') {
      const connections = getConnections(config);
      if (connections.length === 0) {
        throw Error('No wallet connection active');
      }
      if (connections[0].chainId !== env.WAGMI_BASE_ID) {
        await switchChain(config, { chainId: env.WAGMI_BASE_ID });
      }
      const provider = await getEthersProvider(config);
      return getBaseAccountFromProvider(provider);
    } else {
      const { publicKey, connected, connect, signMessage } = useWallet();
      return getSolAccountFromProvider({
        publicKey: publicKey.value!,
        connected: connected.value!,
        connect,
        signMessage: signMessage.value!,
      });
    }
  }

  async saveSettings(content: object) {
    try {
      await this.subAccountClient.createAggregate({
        key: LIBERTAI_SETTINGS_KEY,
        content,
        address: this.account.address,
        channel: LIBERTAI_UI_CHANNEL,
      });
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

  async uploadFile(file: File | Buffer) {
    const message = await this.subAccountClient.createStore({
      fileObject: file,
      storageEngine: ItemType.ipfs,
      channel: LIBERTAI_GENERAL_CHANNEL,
    });
    return message;
  }

  async downloadFile(ipfsHash: string) {
    return this.subAccountClient.downloadFile(ipfsHash);
  }

  async deleteFile(itemHash: string) {
    return this.subAccountClient.forget({ hashes: [itemHash] });
  }

  async fetchKnowledgeBaseIdentifiers(): Promise<KnowledgeBaseIdentifier[] | undefined> {
    try {
      const response = await this.subAccountClient.fetchAggregate(
        this.account.address,
        LIBERTAI_KNOWLEDGE_BASE_IDENTIFIERS_KEY,
      );

      const parsedKnowledgeBaseIdentifiers = knowledgeBaseIdentifiersAlephStorage.safeParse(response);
      if (!parsedKnowledgeBaseIdentifiers.success) {
        throw new Error(`Zod parsing failed: ${parsedKnowledgeBaseIdentifiers.error}`);
      }

      return decryptKnowledgeBaseIdentifiers(parsedKnowledgeBaseIdentifiers.data.data, this.encryptionPrivateKey);
    } catch (error) {
      console.error(`Fetching Knowledge base identifiers from Aleph failed: ${error}`);
      return undefined;
    }
  }

  async createKnowledgeBase(
    kb: KnowledgeBase,
    currentKbIdentifiers: KnowledgeBaseIdentifier[],
  ): Promise<KnowledgeBaseIdentifier | undefined> {
    try {
      // Encryption
      const key = generateKey();
      const iv = generateIv();
      const encryptedKb = encrypt(JSON.stringify(kb), key, iv);

      const response = await this.subAccountClient.createPost({
        postType: LIBERTAI_KNOWLEDGE_BASE_POST_TYPE,
        content: encryptedKb,
        address: this.account.address,
        channel: LIBERTAI_GENERAL_CHANNEL,
        storageEngine: ItemType.storage,
      });

      const identifier: KnowledgeBaseIdentifier = {
        id: kb.id,
        encryption: {
          key: key.toString(),
          iv: iv.toString(),
        },
        post_hash: response.item_hash,
      };

      const newKbIdentifiers = encryptKnowledgeBaseIdentifiers(
        [...currentKbIdentifiers, identifier],
        this.encryptionPrivateKey,
      );

      await this.updateKnowledgeBaseIdentifiers(newKbIdentifiers);
      return identifier;
    } catch (error) {
      console.error(`Creating knowledge base failed: ${error}`);
      return undefined;
    }
  }

  async updateKnowledgeBase(knowledgeBase: KnowledgeBase, kbIdentifier: KnowledgeBaseIdentifier) {
    try {
      const key = Buffer.from(kbIdentifier.encryption.key);
      const iv = Buffer.from(kbIdentifier.encryption.iv);

      const encryptedKb = encrypt(JSON.stringify(knowledgeBase), key, iv);

      await this.subAccountClient.createPost({
        postType: 'amend',
        ref: kbIdentifier.post_hash,
        content: encryptedKb,
        address: this.account.address,
        channel: LIBERTAI_GENERAL_CHANNEL,
        storageEngine: ItemType.storage,
      });
    } catch (error) {
      console.error(`Update of knowledge base ${knowledgeBase.id} failed: ${error}`);
      return undefined;
    }
  }

  async fetchKnowledgeBase(postHash: string, encryptionKey: Buffer, iv: Buffer): Promise<KnowledgeBase | undefined> {
    try {
      const response = await this.subAccountClient.getPost({
        hashes: [postHash],
        channels: [LIBERTAI_GENERAL_CHANNEL],
      });

      const decryptedContent = decrypt(response.content, encryptionKey, iv);
      const parsedKnowledgeBase = knowledgeSchema.safeParse(JSON.parse(decryptedContent));
      if (!parsedKnowledgeBase.success) {
        throw new Error(`Zod parsing failed: ${parsedKnowledgeBase.error}`);
      }
      return parsedKnowledgeBase.data;
    } catch (error) {
      console.error(`Fetching Knowledge base from Aleph post ${postHash} failed: ${error}`);
      return undefined;
    }
  }

  async deleteKnowledgeBase(
    kbIdentifier: KnowledgeBaseIdentifier,
    currentKbIdentifiers: KnowledgeBaseIdentifier[],
  ): Promise<boolean> {
    try {
      await this.subAccountClient.forget({
        hashes: [kbIdentifier.post_hash],
      });

      const newKbIdentifiers = encryptKnowledgeBaseIdentifiers(
        currentKbIdentifiers.filter((kbi) => kbi.id !== kbIdentifier.id),
        this.encryptionPrivateKey,
      );

      await this.updateKnowledgeBaseIdentifiers(newKbIdentifiers);
      return true;
    } catch (error) {
      console.error(`Deleting knowledge base failed: ${error}`);
      return false;
    }
  }

  private async updateKnowledgeBaseIdentifiers(kbIdentifiers: KnowledgeBaseIdentifier[]) {
    return this.subAccountClient.createAggregate({
      key: LIBERTAI_KNOWLEDGE_BASE_IDENTIFIERS_KEY,
      content: {
        data: kbIdentifiers,
      },
      address: this.account.address,
      channel: LIBERTAI_GENERAL_CHANNEL,
    });
  }
}
