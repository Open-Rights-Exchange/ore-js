/* global ORE_TESTA_ACCOUNT_KEY:true */
/* global WALLET_PASSWORD:true */
/* global USER_ACCOUNT_ENCRYPTION_SALT:true */

const { crypto } = require('../../src');

describe('encryption/decryption of private keys with wallet passwords', () => {
  let privateKey;
  let salt;
  let walletPassword;
  let encrypted;
  let encryptedNewSalt;

  beforeAll(() => {
    privateKey = ORE_TESTA_ACCOUNT_KEY;
    salt = USER_ACCOUNT_ENCRYPTION_SALT;
    walletPassword = WALLET_PASSWORD;
    encrypted = crypto.encrypt(privateKey, walletPassword, salt);
    // eslint-disable-next-line quotes
    encryptedNewSalt = "{\"iv\":\"fHK1jwfnqP1YFIj7DMpJbw==\",\"v\":1,\"iter\":10000,\"ks\":128,\"ts\":64,\"mode\":\"gcm\",\"adata\":\"\",\"cipher\":\"aes\",\"salt\":\"JShHjCXd+uI=\",\"ct\":\"JG4H9O/YYcGGCuwZpM+1Is5tK8riZSJRPgCPtYFaF2MVyL2QMYsfXDqPddoRE1jSE+6ksFPV/82VCBw=\"}";
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

  describe('decryptWithKeyNewSaltEncoding', () => {
    it('returns the original private key (using new Salt Encoding)', () => {
      const key = crypto.deriveKey(walletPassword, salt, false);
      const decrypted = crypto.decryptWithKey(encryptedNewSalt, key);
      expect(decrypted.toString()).toMatch(privateKey);
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

    it('returns the original privateKey (with new Salt Encoding)', () => {
      const decrypted = crypto.decrypt(encryptedNewSalt, walletPassword, salt);
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
