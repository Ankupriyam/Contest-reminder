import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../services/crypto.service.js';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

describe('Crypto Service', () => {
  it('should encrypt and decrypt correctly using AES-256-GCM', () => {
    const originalText = 'Hello World - Competitive Programming!';
    const ciphertext = encrypt(originalText);
    
    // Check format: ivHex:authTagHex:encryptedText
    const parts = ciphertext.split(':');
    expect(parts.length).toBe(3);
    
    const decrypted = decrypt(ciphertext);
    expect(decrypted).toBe(originalText);
  });

  it('should generate different ciphertexts for the same plaintext (IV randomness)', () => {
    const text = 'Symmetric Encryption Check';
    const cipher1 = encrypt(text);
    const cipher2 = encrypt(text);
    
    expect(cipher1).not.toBe(cipher2);
  });

  it('should fallback to decrypting legacy AES-256-CBC payloads', () => {
    // Manually create a legacy CBC payload using the environment variables
    const legacyKey = Buffer.from(env.ENCRYPTION_KEY, 'hex');
    const legacyIv = Buffer.from(env.ENCRYPTION_IV!, 'hex');
    const plaintext = 'Legacy CBC Token Data';
    
    const cipher = crypto.createCipheriv('aes-256-cbc', legacyKey, legacyIv);
    let legacyEncrypted = cipher.update(plaintext, 'utf8', 'hex');
    legacyEncrypted += cipher.final('hex');
    
    const legacyPayload = `${legacyIv.toString('hex')}:${legacyEncrypted}`;
    
    // Verify fallback decrypt works on CBC
    const decrypted = decrypt(legacyPayload);
    expect(decrypted).toBe(plaintext);
  });

  it('should throw an error for malformed ciphertexts', () => {
    expect(() => decrypt('short-malformed-text')).toThrow('Invalid encrypted text format');
  });
});
