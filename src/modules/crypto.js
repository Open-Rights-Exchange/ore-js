const sjcl = require('sjcl');

// PRIVATE

// Encrypts the EOS private key with the derived key
function encryptWithKey(unencrypted, key) {
  const encrypted = JSON.parse(sjcl.encrypt(key, unencrypted, { mode: 'gcm' }));
  return JSON.stringify(encrypted);
}

// PUBLIC

// Derive the key used for encryption/decryption
// TODO: change default value for useOldSaltEncoding to false after migrating keys
function deriveKey(password, salt, useOldSaltEncoding = true) {
  let saltArray = salt;
  if (!useOldSaltEncoding) {
    // correct usage of this library is to convert the salt to a BitArray - otherwise it won't be decodable correcly using the expected approach
    saltArray = stringToBitArray(salt || '');
  }
  // NOTE Passing in at least an empty string for the salt, will prevent cached keys, which can lead to false positives in the test suite
  const { key } = sjcl.misc.cachedPbkdf2(password, { iter: 1000, salt: saltArray });
  // new salt encoding expects the key object to be converted explicity to a string
  return (useOldSaltEncoding) ? key : bitArrayToString(key);
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
  // try decrypting with new Salt encoding approach
  let decrypted = decryptWithKey(encrypted, deriveKey(password, salt, false));
  if (decrypted === '') {
    // if decrypt fails, try using the old Salt encoding approach
    decrypted = decryptWithKey(encrypted, deriveKey(password, salt, true));
  }
  return decrypted;
}

// Encrypts the EOS private key with wallet password, and salt
// TODO: change default value for useOldSaltEncoding to false after migrating keys
function encrypt(unencrypted, password, salt, useOldSaltEncoding = true) {
  return encryptWithKey(unencrypted, deriveKey(password, salt, useOldSaltEncoding));
}

function stringToBitArray(value) {
  return sjcl.codec.base64.toBits(value);
}

function bitArrayToString(value) {
  return sjcl.codec.base64.fromBits(value);
}

module.exports = {
  decrypt,
  decryptWithKey,
  deriveKey,
  encrypt
};
