import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
// @ts-ignore
import { BufferEncoding } from 'vite-plugin-checker/dist/cjs/checkers/vueTsc/typescript-vue-tsc';

// Global settings
const ALGORITHM = 'aes-256-cbc';
const INPUT_ENCODING = 'utf8';
const OUTPUT_ENCODING = 'hex';
export const BUFFER_ENCODING: BufferEncoding = 'hex';

export const encrypt = (data: string, key: Buffer, iv: Buffer): string => {
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(data, INPUT_ENCODING, OUTPUT_ENCODING);
  encrypted += cipher.final(OUTPUT_ENCODING);
  return encrypted;
};

export const decrypt = (encryptedText: string, key: Buffer, iv: Buffer): string => {
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, OUTPUT_ENCODING, INPUT_ENCODING);
  decrypted += decipher.final(INPUT_ENCODING);
  return decrypted;
};

export const encryptFile = async (file: File, key: Buffer, iv: Buffer): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const bufferString = Buffer.from(arrayBuffer).toString(BUFFER_ENCODING);
  const encryptedString = encrypt(bufferString, key, iv);
  return Buffer.from(encryptedString);
};

export const decryptFile = (arrayBuffer: ArrayBuffer, key: Buffer, iv: Buffer): Buffer => {
  const fileBufferString = Buffer.from(arrayBuffer).toString();
  const decryptedString = decrypt(fileBufferString, key, iv);
  return Buffer.from(decryptedString, BUFFER_ENCODING);
};

export const generateKey = () => Buffer.from(randomBytes(16).toString('hex'));
export const generateIv = () => Buffer.from(randomBytes(8).toString('hex'));
