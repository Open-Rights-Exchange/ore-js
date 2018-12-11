const { Keygen } = require('eosjs-keygen');

const ACCOUNT_NAME_MAX_LENGTH = 12;
const BASE = 31; // Base 31 allows us to leave out '.', as it's used for account scope

/* Private */

function newAccountTransaction(name, ownerPublicKey, activePublicKey, orePayerAccountName, options = {}) {
  const { broadcast, bytes, permission, stakedCpu, stakedNet, transfer, tokenSymbol } = {
    broadcast: true,
    bytes: 2048,
    permission: 'active',
    stakedCpu: 0.1000,
    stakedNet: 0.1000,
    transfer: false,
    ...options
  };

  let actions = [{
    account: 'eosio',
    name: 'newaccount',
    authorization: [{
      actor: orePayerAccountName,
      permission,
    }],
    data: {
      creator: orePayerAccountName,
      newact: name, // NOTE: This will need to be changed back, once the testnets update
      owner: {
        threshold: 1,
        keys: [{
          key: ownerPublicKey,
          weight: 1,
        }],
        accounts: [],
        waits: [],
      },
      active: {
        threshold: 1,
        keys: [{
          key: activePublicKey,
          weight: 1,
        }],
        accounts: [],
        waits: [],
      },
    },
  },
  {
    account: 'eosio',
    name: 'buyrambytes',
    authorization: [{
      actor: orePayerAccountName,
      permission,
    }],
    data: {
      payer: orePayerAccountName,
      receiver: name,
      bytes: bytes,
    },
  },
  {
    account: 'eosio',
    name: 'delegatebw',
    authorization: [{
      actor: orePayerAccountName,
      permission,
    }],
    data: {
      from: orePayerAccountName,
      receiver: name,
      stake_net_quantity: `${stakedNet} ${tokenSymbol}`,
      stake_cpu_quantity: `${stakedCpu} ${tokenSymbol}`,
      transfer: transfer,
    },
  }];
  return this.transact(actions, broadcast);
}

function eosBase32(base32String) {
  // NOTE: Returns valid EOS base32, which is different than the standard JS base32 implementation
  return base32String
    .replace(/0/g, 'v')
    .replace(/6/g, 'w')
    .replace(/7/g, 'x')
    .replace(/8/g, 'y')
    .replace(/9/g, 'z');
}

function timestampEosBase32() {
  // NOTE: Returns a UNIX timestamp, that is EOS base32 encoded
  return eosBase32(Date.now().toString(BASE));
}

function randomEosBase32() {
  // NOTE: Returns a random string, that is EOS base32 encoded
  return eosBase32(Math.random().toString(BASE).substr(2));
}

function generateAccountNameString() {
  return (timestampEosBase32() + randomEosBase32()).substr(0, 12);
}

async function getNameAlreadyExists(accountName) {
  try {
    await this.eos.rpc.get_account(accountName);
    return true;
  } catch(e) {
    return false;
  }
}

// Recursively generates account names, until a uniq name is generated...
async function generateAccountName() {
  // NOTE: account names MUST be base32 encoded, and be 12 characters, in compliance with the EOS standard
  // NOTE: account names can also contain only the following characters: a-z, 1-5, & '.' In regex: [a-z1-5\.]{12}
  // NOTE: account names are generated based on the current unix timestamp + some randomness, and cut to be 12 chars
  let accountName = generateAccountNameString.bind(this)();
  const nameAlreadyExists = await getNameAlreadyExists.bind(this)(accountName);
  if (nameAlreadyExists) {
    return generateAccountName.bind(this)();
  } else {
    return accountName;
  }
}

function encryptKeys(keys, password, salt) {
  const encryptedKeys = keys;
  const encryptedWalletPassword = this.encrypt(keys.masterPrivateKey, password, salt).toString();
  encryptedKeys.masterPrivateKey = encryptedWalletPassword;
  encryptedKeys.privateKeys.owner = this.encrypt(keys.privateKeys.owner, password, salt).toString();
  encryptedKeys.privateKeys.active = this.encrypt(keys.privateKeys.active, password, salt).toString();
  return encryptedKeys;
}

async function getAccountPermissions(oreAccountName) {
  const account = await this.eos.rpc.get_account(oreAccountName);
  const {
    permissions,
  } = account;

  return permissions;
}

function weightedKey(key, weight = 1) {
  return { key, weight };
}

function weightedKeys(keys, weight = 1) {
  return keys.map(key => weightedKey(key, weight));
}

function newPermissionDetails(keys, threshold = 1, weights = 1) {
  return {
    accounts: [],
    keys: weightedKeys.bind(this)(keys, weights),
    threshold,
    waits: [],
  };
}

function newPermission(keys, permName, parent = 'active', threshold = 1, weights = 1) {
  return {
    parent,
    perm_name: permName,
    required_auth: newPermissionDetails.bind(this)(keys, threshold, weights),
  };
}

async function appendPermission(oreAccountName, keys, permName, parent = 'active', threshold = 1, weights = 1) {
  const perms = await getAccountPermissions.bind(this)(oreAccountName);
  const newPerm = newPermission.bind(this)(keys, permName, parent, threshold, weights);

  perms.push(newPerm);
  return perms;
}

async function addAuthPermission(oreAccountName, keys, permName, code, type, broadcast) {
  const perms = await appendPermission.bind(this)(oreAccountName, keys, permName);
  const actions = perms.map((perm) => {
    const { perm_name:permission, parent, required_auth:auth } = perm;
    return {
      account: 'eosio',
      name: 'updateauth',
      authorization: [{
        actor: oreAccountName,
        permission: 'owner',
      }],
      data: {
        account: oreAccountName,
        permission,
        parent,
        auth,
      },
    };
  });

  actions.push({
    account: 'eosio',
    name: 'linkauth',
    authorization: [{
      actor: oreAccountName,
      permission: 'owner',
    }],
    data: {
      account: oreAccountName,
      code,
      type,
      requirement: permName,
    },
  });

  return this.transact(actions, broadcast);
}

async function generateAuthKeys(oreAccountName, permName, code, action, broadcast) {
  const authKeys = await Keygen.generateMasterKeys();
  await addAuthPermission.bind(this)(oreAccountName, [authKeys.publicKeys.active], permName, code, action, broadcast);
  return authKeys;
}

async function createOreAccountWithKeys(activePublicKey, ownerPublicKey, orePayerAccountName, options = {}) {
  options = {confirm: true, ...options};
  let { oreAccountName } = options;

  oreAccountName = oreAccountName || await generateAccountName.bind(this)();
  let transaction;
  if (confirm) {
    transaction = await this.awaitTransaction(() => newAccountTransaction.bind(this)(oreAccountName, ownerPublicKey, activePublicKey, orePayerAccountName, options));
  } else {
    transaction = await newAccountTransaction.bind(this)(oreAccountName, ownerPublicKey, activePublicKey, orePayerAccountName, options);
  }
  return { oreAccountName, transaction };
}

async function generateOreAccountAndKeys(ownerPublicKey, orePayerAccountName, options = {}) {
  const keys = await Keygen.generateMasterKeys();

  const {
    oreAccountName,
    transaction,
  } = await createOreAccountWithKeys.bind(this)(keys.publicKeys.active, ownerPublicKey, orePayerAccountName, options);

  return { keys, oreAccountName, transaction };
}

async function generateOreAccountAndEncryptedKeys(password, salt, ownerPublicKey, orePayerAccountName, options = {}) {
  const {
    keys, oreAccountName, transaction,
  } = await generateOreAccountAndKeys.bind(this)(ownerPublicKey, orePayerAccountName, options);

  const encryptedKeys = await encryptKeys.bind(this)(keys, password, salt);
  return { encryptedKeys, oreAccountName, transaction };
}

/* Public */

// Creates an EOS account, without verifier auth keys
async function createAccount(password, salt, ownerPublicKey, orePayerAccountName, options = {}) {
  options = {
    broadcast: true,
    ...options
  };
  const { broadcast } = options;

  const {
    encryptedKeys, oreAccountName, transaction,
  } = await generateOreAccountAndEncryptedKeys.bind(this)(password, salt, ownerPublicKey, orePayerAccountName, options);

  return {
    oreAccountName,
    privateKey: encryptedKeys.privateKeys.active,
    publicKey: encryptedKeys.publicKeys.active,
    transaction,
  };
}

// Creates an EOS account, with verifier auth keys
async function createOreAccount(password, salt, ownerPublicKey, orePayerAccountName, options = {}) {
  const { broadcast } = options;

  const returnInfo = await createAccount.bind(this)(password, salt, ownerPublicKey, orePayerAccountName, options);
  const verifierAuthKeys = await generateAuthKeys.bind(this)(returnInfo.oreAccountName, 'authverifier', 'token.ore', 'approve', broadcast);

  returnInfo.verifierAuthKey = verifierAuthKeys.privateKeys.active;
  returnInfo.verifierAuthPublicKey = verifierAuthKeys.publicKeys.active;

  return returnInfo;
}

module.exports = {
  createAccount,
  createOreAccount,
  eosBase32,
  getNameAlreadyExists,
};
