const fs = require('fs');
const { crypto, walletPassword, salt } = require('./index');

const USER = 'test2.apim';
(async function () {
  const account = process.env.ORE_OWNER_ACCOUNT_NAME;
  const privateKey = process.env.ORE_OWNER_ACCOUNT_KEY;
  console.log('Account:', account);

  const encryptedKey = crypto.encrypt(privateKey, walletPassword, salt).toString();
  console.log('Encrypted Key:', encryptedKey);

  const decryptedKey = crypto.decrypt(encryptedKey, walletPassword, salt).toString();
  console.log('Decrypted Key Matches:', decryptedKey == privateKey);
}());
