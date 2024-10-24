import { decrypt as eciesDecrypt, encrypt as eciesEncrypt, PrivateKey } from 'eciesjs';
import { KnowledgeBaseIdentifier } from 'src/types/knowledge';
import { BUFFER_ENCODING } from 'src/utils/encryption';

export const encryptKnowledgeBaseIdentifiers = (
  identifiers: KnowledgeBaseIdentifier[],
  encryptionKey: PrivateKey,
): KnowledgeBaseIdentifier[] =>
  identifiers.map(
    (kbIdentifier): KnowledgeBaseIdentifier => ({
      ...kbIdentifier,
      encryption: {
        key: eciesEncrypt(encryptionKey.publicKey.toHex(), Buffer.from(kbIdentifier.encryption.key)).toString(
          BUFFER_ENCODING,
        ),
        iv: eciesEncrypt(encryptionKey.publicKey.toHex(), Buffer.from(kbIdentifier.encryption.iv)).toString(
          BUFFER_ENCODING,
        ),
      },
    }),
  );

export const decryptKnowledgeBaseIdentifiers = (
  identifiers: KnowledgeBaseIdentifier[],
  encryptionKey: PrivateKey,
): KnowledgeBaseIdentifier[] =>
  identifiers.map((kbIdentifier): KnowledgeBaseIdentifier => {
    const decryptedKey = eciesDecrypt(
      encryptionKey.secret,
      Buffer.from(kbIdentifier.encryption.key, BUFFER_ENCODING),
    ).toString();
    const decryptedIv = eciesDecrypt(
      encryptionKey.secret,
      Buffer.from(kbIdentifier.encryption.iv, BUFFER_ENCODING),
    ).toString();

    return { ...kbIdentifier, encryption: { key: decryptedKey, iv: decryptedIv } };
  });
