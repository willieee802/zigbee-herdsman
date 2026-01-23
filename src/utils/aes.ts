import * as crypto from 'crypto';
import { logger } from './logger';

const IV_MAC_PREFIX = '01010101010101010101';
/**
 * PKCS7 填充
 * @param data 需要填充的数据
 * @param blockSize 块大小，默认 16
 * @returns 填充后的数据
 */
function pkcs7Pad(data: Buffer, blockSize: number = 16): Buffer {
  const padLen = blockSize - (data.length % blockSize);
  const padding = Buffer.alloc(padLen, padLen);
  return Buffer.concat([data as any, padding as any] as any);
}

/**
 * PKCS7 去填充
 * @param data 需要去填充的数据
 * @returns 去填充后的数据
 */
function pkcs7Unpad(data: Buffer): Buffer {
  if (data.length === 0) {
    return data;
  }
  const padLen = data[data.length - 1];
  if (padLen < 1 || padLen > 16) {
    return data;
  }
  return data.slice(0, data.length - padLen);
}

/**
 * 将 hex 字符串转换为 Buffer
 * @param hex hex 字符串
 * @returns Buffer
 */
function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}

/**
 * AES CBC 模式加密，返回 base64 字符串
 * @param plainText 明文（UTF-8 字符串）
 * @param keyHex 密钥（hex 字符串，32 或 64 位）
 * @param ivHex IV（hex 字符串）
 * @returns base64 编码的密文
 */
export function aesCbcEncryptBase64(
  plainText: string,
  keyHex: string,
  ivHex: string,
): string {
  const key = hexToBuffer(keyHex);
  const iv = hexToBuffer(IV_MAC_PREFIX + ivHex);

  if (key.length !== 16 && key.length !== 32) {
    throw new Error('Key length must be 16 or 32 bytes (hex: 32 or 64 chars)');
  }

  // 根据密钥长度选择算法
  const algorithm = key.length === 16 ? 'aes-128-cbc' : 'aes-256-cbc';

  // 将明文转换为 UTF-8 字节并填充
  const data = pkcs7Pad(Buffer.from(plainText, 'utf-8'), 16);

  // 创建加密器
  const cipher = crypto.createCipheriv(algorithm, key as any, iv as any);

  // 加密：update 处理所有数据，final 应该返回空（因为数据已经是完整块）
  // 但 Node.js 的 crypto 模块在某些情况下 final() 会返回额外数据，需要特殊处理
  const encrypted = cipher.update(data as any);
  const final = cipher.final() as Buffer;

  // 如果 final 返回了数据且 update 已处理完整数据，只使用 update 的结果（与 Python 行为一致）
  const result =
    final.length > 0 && encrypted.length === data.length
      ? encrypted
      : Buffer.concat([encrypted as Buffer, final] as any);

  // 返回 base64 编码
  return result.toString('base64');
}

/**
 * AES CBC 模式解密，从 base64 字符串解密
 * @param cipherB64 base64 编码的密文
 * @param keyHex 密钥（hex 字符串，32 或 64 位）
 * @param ivHex IV（hex 字符串）
 * @returns 解密后的 UTF-8 字符串
 */
export function aesCbcDecryptBase64(
  cipherB64: string,
  keyHex: string,
  ivHex: string,
): string {
  const key = hexToBuffer(keyHex);
  const iv = hexToBuffer(IV_MAC_PREFIX + ivHex);

  if (key.length !== 16 && key.length !== 32) {
    throw new Error('Key length must be 16 or 32 bytes (hex: 32 or 64 chars)');
  }

  // 根据密钥长度选择算法
  const algorithm = key.length === 16 ? 'aes-128-cbc' : 'aes-256-cbc';

  // 解码 base64
  const cipherBytes = Buffer.from(cipherB64, 'base64');

  // 创建解密器
  const decipher = crypto.createDecipheriv(algorithm, key as any, iv as any);

  // 解密
  const decrypted = Buffer.concat([
    decipher.update(cipherBytes as any) as Buffer,
    decipher.final() as Buffer,
  ] as any);

  // 去填充并转换为 UTF-8 字符串
  const unpadded = pkcs7Unpad(decrypted);
  return unpadded.toString('utf-8');
}

/**
 * AES CBC 模式加密 hex 字符串，返回 base64
 * @param plainHex 明文的 hex 字符串（如 'FE00210120'）
 * @param keyHex 密钥（hex 字符串，32 或 64 位）
 * @param ivHex IV（hex 字符串）
 * @returns base64 编码的密文
 */
export function aesCbcEncryptBase64Hex(
  plainHex: string,
  keyHex: string,
  ivHex: string,
): string {
  const key = hexToBuffer(keyHex);
  const iv = hexToBuffer(IV_MAC_PREFIX + ivHex);

  if (key.length !== 16 && key.length !== 32) {
    throw new Error('Key length must be 16 or 32 bytes (hex: 32 or 64 chars)');
  }

  // 根据密钥长度选择算法
  const algorithm = 'aes-128-cbc';

  // 将 hex 字符串转换为 Buffer 并填充
  const data = pkcs7Pad(hexToBuffer(plainHex), 16);

  // 创建加密器
  const cipher = crypto.createCipheriv(algorithm, key as any, iv as any);
  // 禁用自动填充，因为我们已经手动进行了 PKCS7 填充
  cipher.setAutoPadding(false);

  // 加密：update 处理所有数据，final 应该返回空（因为数据已经是完整块）
  // 但 Node.js 的 crypto 模块在某些情况下 final() 会返回额外数据，需要特殊处理
  const encrypted = cipher.update(data as any);
  const final = cipher.final() as Buffer;

  // 如果 final 返回了数据且 update 已处理完整数据，只使用 update 的结果（与 Python 行为一致）
  const result =
    final.length > 0 && encrypted.length === data.length
      ? encrypted
      : Buffer.concat([encrypted as Buffer, final] as any);

  // 返回 base64 编码
  return result.toString('base64');
}

/**
 * AES CBC 模式解密，从 base64 解密为 hex 字符串
 * @param cipherB64 base64 编码的密文
 * @param keyHex 密钥（hex 字符串，32 或 64 位）
 * @param ivHex IV（hex 字符串）
 * @returns 解密后的 hex 字符串（大写）
 */
/**
 * AES CBC 模式解密，从 base64 解密为 hex 字符串
 * @param cipherB64 base64 编码的密文
 * @param keyHex 密钥（hex 字符串，32 或 64 位）
 * @param ivHex IV（hex 字符串）
 * @returns 解密后的 hex 字符串（大写）
 */
export function aesCbcDecryptBase64ToHex(
  cipherB64: string,
  keyHex: string,
  ivHex: string,
): string {
  logger.debug('解密前' + cipherB64, 'zh:aes');
  const key = hexToBuffer(keyHex);
  const iv = hexToBuffer(IV_MAC_PREFIX + ivHex);

  if (key.length !== 16 && key.length !== 32) {
    throw new Error('Key length must be 16 or 32 bytes (hex: 32 or 64 chars)');
  }

  // 根据密钥长度选择算法
  const algorithm = key.length === 16 ? 'aes-128-cbc' : 'aes-256-cbc';

  // 解码 base64
  const cipherBytes = Buffer.from(cipherB64, 'base64');

  // 创建解密器
  const decipher = crypto.createDecipheriv(algorithm, key as any, iv as any);
  // 禁用自动填充，因为我们要手动处理 PKCS7 填充
  decipher.setAutoPadding(false);

  // 解密
  const decrypted = Buffer.concat([
    decipher.update(cipherBytes as any),
    decipher.final() as any,
  ]);

  // 去填充并转换为 hex 字符串（大写）
  const unpadded = pkcs7Unpad(decrypted);
  const res = unpadded.toString('hex').toUpperCase();
  logger.debug('解密后:' + res, 'zh:aes');
  return res;
}
