const sjcl = require('sjcl');

// PRIVATE

// Encrypts the EOS private key with the derived key
function encryptWithKey(unencrypted, key) {
  const encrypted = JSON.parse(sjcl.encrypt(key, unencrypted, { mode: 'gcm' }));
  return JSON.stringify(encrypted);
}

// PUBLIC

// Derive the key used for encryption/decryption
function deriveKey(password, salt) {
  // NOTE Passing in at least an empty string for the salt, will prevent cached keys, which can lead to false positives in the test suite
  const { key } = sjcl.misc.cachedPbkdf2(password, { iter: 1000, salt: salt || '' });
  return key;
}

// Decrypts the encrypted EOS private key with the derived key
function decryptWithKey(encrypted, key) {
  try {
    const encryptedData = JSON.stringify(Object.assign(JSON.parse(encrypted), { mode: 'gcm' }));
    return sjcl.decrypt(key, encryptedData);
  } catch (err) {
    // console.error('Decryption Error:', err);
    return '';
  }
}

// Decrypts the encrypted EOS private key with wallet password, and salt
function decrypt(encrypted, password, salt) {
  return decryptWithKey(encrypted, deriveKey(password, salt));
}

// Encrypts the EOS private key with wallet password, and salt
function encrypt(unencrypted, password, salt) {
  return encryptWithKey(unencrypted, deriveKey(password, salt));
}

module.exports = {
  decrypt,
  decryptWithKey,
  deriveKey,
  encrypt
};
