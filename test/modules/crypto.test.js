/* global ORE_TESTA_ACCOUNT_KEY:true */
/* global WALLET_PASSWORD:true */
/* global USER_ACCOUNT_ENCRYPTION_SALT:true */

import { crypto } from '../../src';

describe('encryption/decryption of private keys with wallet passwords', () => {
  let privateKey;
  let salt;
  let walletPassword;
  let encrypted;

  beforeAll(() => {
    privateKey = ORE_TESTA_ACCOUNT_KEY;
    salt = USER_ACCOUNT_ENCRYPTION_SALT;
    walletPassword = WALLET_PASSWORD;
    encrypted = crypto.encrypt(privateKey, walletPassword, salt);
  });

  describe('deriveKey', () => {
    it('returns a deterministic salt', () => {
      expect(crypto.deriveKey(walletPassword, salt)).toEqual(crypto.deriveKey(walletPassword, salt));
      expect(crypto.deriveKey(walletPassword, salt)).not.toEqual(crypto.deriveKey(walletPassword, ''));
    });
  });

  describe('decryptWithKey', () => {
    it('returns the original private key', () => {
      const key = crypto.deriveKey(walletPassword, salt);
      const decrypted = crypto.decryptWithKey(encrypted, key);
      expect(decrypted.toString()).toMatch(privateKey);
    });

    it('does not return privateKey with a bad key', () => {
      const key = 'badkey';
      const decrypted = crypto.decryptWithKey(encrypted, key);
      expect(decrypted.toString()).not.toMatch(privateKey);
    });
  });

  describe('encrypt', () => {
    it('returns an encrypted string', () => {
      expect(encrypted.toString()).toEqual(expect.not.stringContaining(privateKey));
    });
  });

  describe('decrypt', () => {
    it('returns the original privateKey', () => {
      const decrypted = crypto.decrypt(encrypted, walletPassword, salt);
      expect(decrypted.toString()).toMatch(privateKey);
    });

    it('does not return privateKey with a bad password', () => {
      const badPassword = 'BadPassword';
      const decrypted = crypto.decrypt(encrypted, badPassword, salt);
      expect(decrypted.toString()).not.toMatch(privateKey);
    });

    it('does not return privateKey with a bad salt', () => {
      const badPassword = 'BadPassword';
      const decrypted = crypto.decrypt(encrypted, walletPassword, '');
      expect(decrypted.toString()).not.toMatch(privateKey);
    });
  });
});
