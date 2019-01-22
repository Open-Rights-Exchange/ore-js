const { Keygen } = require('eosjs-keygen');

const ACCOUNT_NAME_MAX_LENGTH = 12;
const BASE = 31; // Base 31 allows us to leave out '.', as it's used for account scope

/* Private */

function newAccountTransaction(name, ownerPublicKey, activePublicKey, orePayerAccountName, options = {}) {
  const { broadcast, bytes, permission, stakedCpu, stakedNet, transfer, tokenSymbol } = {
    broadcast: true,
    bytes: 2048,
    permission: 'active',
    stakedCpu: '0.1000',
    stakedNet: '0.1000',
    tokenSymbol: this.chainName === 'ore' ? 'SYS' : 'EOS',
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
      name,
      newact: name, // Some versions of the system contract are running a different version of the newaccount code
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

function weightKeys(keys, weight = 1) {
  return keys.map(key => weightedKey(key, weight));
}

function newPermissionDetails(keys, threshold = 1, weights = 1) {
  return {
    accounts: [],
    keys: weightKeys.bind(this)(keys, weights),
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
  const existingPerm = perms.find(perm => perm.perm_name === permName);
  if (existingPerm) { // NOTE: Add new keys & update the parent permission
    const weightedKeys = weightKeys.bind(this)(keys, weights);
    existingPerm.required_auth.keys = existingPerm.required_auth.keys.concat(weightedKeys);
    existingPerm.parent = parent;
    return existingPerm;
  } else {
    const newPerm = newPermission.bind(this)(keys, permName, parent, threshold, weights);
    return newPerm;
  }
}

// NOTE: This method is specific to creating authVerifier keys...
async function generateAuthKeys(oreAccountName, permName, code, action, broadcast) {
  const authKeys = await Keygen.generateMasterKeys();
  const options = { broadcast, authPermission: 'owner', links: [{ code, type: action }] }
  await addPermission.bind(this)(oreAccountName, [authKeys.publicKeys.active], permName, 'active', options);
  return authKeys;
}

async function createOreAccountWithKeys(activePublicKey, ownerPublicKey, orePayerAccountName, options = {}) {
  options = {
    confirm: true,
    ...options
  };
  let oreAccountName = options.oreAccountName || await generateAccountName.bind(this)();

  let transaction;
  if (options.confirm) {
    transaction = await this.awaitTransaction(() => newAccountTransaction.bind(this)(oreAccountName, ownerPublicKey, activePublicKey, orePayerAccountName, options));
  } else {
    transaction = await newAccountTransaction.bind(this)(oreAccountName, ownerPublicKey, activePublicKey, orePayerAccountName, options);
  }
  return { oreAccountName, transaction };
}

async function generateOreAccountAndKeys(ownerPublicKey, orePayerAccountName, options = {}) {
  const keys = options.keys || await Keygen.generateMasterKeys();

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

  const encryptedKeys = encryptKeys.bind(this)(keys, password, salt);
  return { encryptedKeys, oreAccountName, transaction, keys };
}

// Creates an account, without verifier auth keys
async function createAccount(password, salt, ownerPublicKey, orePayerAccountName, options = {}) {
  options = {
    broadcast: true,
    ...options
  };
  const { broadcast } = options;

  const {
    encryptedKeys, oreAccountName, transaction, keys,
  } = await generateOreAccountAndEncryptedKeys.bind(this)(password, salt, ownerPublicKey, orePayerAccountName, options);

  return {
    oreAccountName,
    privateKey: encryptedKeys.privateKeys.active,
    publicKey: encryptedKeys.publicKeys.active,
    keys,
    transaction,
  };
}

/* Public */

async function addPermission(authAccountName, keys, permissionName, parentPermission, options = {}) {
  options = {
    authPermission: 'active',
    ...options
  }
  const { authPermission, links = [], broadcast = true } = options;
  const perm = await appendPermission.bind(this)(authAccountName, keys, permissionName, parentPermission);
  const { perm_name:permission, parent, required_auth:auth } = perm;
  const actions = [{
    account: 'eosio',
    name: 'updateauth',
    authorization: [{
      actor: authAccountName,
      permission: authPermission,
    }],
    data: {
      account: authAccountName,
      permission,
      parent,
      auth,
    },
  }];

  links.forEach(link => {
    const { code, type } = link;
    actions.push({
      account: 'eosio',
      name: 'linkauth',
      authorization: [{
        actor: authAccountName,
        permission: authPermission,
      }],
      data: {
        account: authAccountName,
        code,
        type,
        requirement: permission,
      }
    });
  });

  return this.transact(actions, broadcast);
}

async function createKeyPair(password, salt, authAccountName, permissionName, options = {}) {
  options = {
    parentPermission: 'active',
    keys: await Keygen.generateMasterKeys(),
    ...options
  }
  const { keys, parentPermission } = options;
  await addPermission.bind(this)(authAccountName, [keys.publicKeys.active], permissionName, parentPermission, options);
  const encryptedKeys = encryptKeys.bind(this)(keys, password, salt);
  return encryptedKeys;
}

// Creates an account, with verifier auth keys for ORE, and without for EOS
async function createOreAccount(password, salt, ownerPublicKey, orePayerAccountName, options = {}) {
  const { broadcast } = options;

  const returnInfo = await createAccount.bind(this)(password, salt, ownerPublicKey, orePayerAccountName, options);

  if (this.chainName === 'ore') {
    const verifierAuthKeys = await generateAuthKeys.bind(this)(returnInfo.oreAccountName, 'authverifier', 'token.ore', 'approve', broadcast);

    returnInfo.verifierAuthKey = verifierAuthKeys.privateKeys.active;
    returnInfo.verifierAuthPublicKey = verifierAuthKeys.publicKeys.active;
  }

  return returnInfo;
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

async function getNameAlreadyExists(accountName) {
  try {
    await this.eos.rpc.get_account(accountName);
    return true;
  } catch(e) {
    return false;
  }
}

async function removePermission(authAccountName, permissionName, options = {}) {
  options = {
    authPermission: 'active',
    ...options
  }
  const { authPermission, broadcast = true } = options;
  const perms = await getAccountPermissions.bind(this)(authAccountName);

  const actions = [];
  for (const perm of perms) {
    let { perm_name:permission, parent, required_auth:auth } = perm;
    actions.push({
      account: 'eosio',
      name: 'deleteauth',
      authorization: [{
        actor: authAccountName,
        permission: authPermission,
      }],
      data: {
        account: authAccountName,
        permission,
      }
    });
  }

  return this.transact(actions, broadcast);
}

module.exports = {
  addPermission,
  createKeyPair,
  createOreAccount,
  eosBase32,
  getNameAlreadyExists,
  removePermission,
};
