const { Keygen } = require('eosjs-keygen');

const ACCOUNT_NAME_MAX_LENGTH = 12;
const BASE = 31; // Base 31 allows us to leave out '.', as it's used for account scope

/* Private */
// gets the input values(blocksToCheck, checkInterval, getBlockAttempts) required for the awaitTranaction method
function getAwaitTransactionOptions(options) {
  const awaitTransactionOptions = {};
  ({ blocksToCheck: awaitTransactionOptions.blocksToCheck, checkInterval: awaitTransactionOptions.checkInterval, getBlockAttempts: awaitTransactionOptions.getBlockAttempts } = options);
  return awaitTransactionOptions;
}

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

  const actions = [{
    account: 'eosio',
    name: 'newaccount',
    authorization: [{
      actor: orePayerAccountName,
      permission
    }],
    data: {
      creator: orePayerAccountName,
      name,
      newact: name, // Some versions of the system contract are running a different version of the newaccount code
      owner: {
        threshold: 1,
        keys: [{
          key: ownerPublicKey,
          weight: 1
        }],
        accounts: [],
        waits: []
      },
      active: {
        threshold: 1,
        keys: [{
          key: activePublicKey,
          weight: 1
        }],
        accounts: [],
        waits: []
      }
    }
  },
  {
    account: 'eosio',
    name: 'buyrambytes',
    authorization: [{
      actor: orePayerAccountName,
      permission
    }],
    data: {
      payer: orePayerAccountName,
      receiver: name,
      bytes
    }
  },
  {
    account: 'eosio',
    name: 'delegatebw',
    authorization: [{
      actor: orePayerAccountName,
      permission
    }],
    data: {
      from: orePayerAccountName,
      receiver: name,
      stake_net_quantity: `${stakedNet} ${tokenSymbol}`,
      stake_cpu_quantity: `${stakedCpu} ${tokenSymbol}`,
      transfer
    }
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

function generateAccountNameString(prefix = '') {
  return (prefix + timestampEosBase32() + randomEosBase32()).substr(0, 12);
}

function encrypted(key) {
  if (key.match(/^\{.*\}$/)) {
    return true;
  }
  return false;
}

function encryptKeys(keys, password, salt) {
  const { privateKeys, publicKeys } = keys;
  const encryptedKeys = {
    privateKeys: {
      owner: encrypted(keys.privateKeys.owner) ? keys.privateKeys.owner : this.encrypt(keys.privateKeys.owner, password, salt).toString(),
      active: encrypted(keys.privateKeys.active) ? keys.privateKeys.active : this.encrypt(keys.privateKeys.active, password, salt).toString()
    },
    publicKeys: { ...publicKeys }
  };
  return encryptedKeys;
}

async function getAccountPermissions(oreAccountName) {
  const account = await this.eos.rpc.get_account(oreAccountName);
  const {
    permissions
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
    waits: []
  };
}

function newPermission(keys, permName, parent = 'active', threshold = 1, weights = 1) {
  return {
    parent,
    perm_name: permName,
    required_auth: newPermissionDetails.bind(this)(keys, threshold, weights)
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
  }
  const newPerm = newPermission.bind(this)(keys, permName, parent, threshold, weights);
  return newPerm;
}

// NOTE: This method is specific to creating authVerifier keys...
async function generateAuthKeys(oreAccountName, permName, code, action, broadcast) {
  const authKeys = await Keygen.generateMasterKeys();
  const options = { broadcast, authPermission: 'owner', links: [{ code, type: action }] };
  await addPermission.bind(this)(oreAccountName, [authKeys.publicKeys.active], permName, 'active', options);
  return authKeys;
}

async function createOreAccountWithKeys(activePublicKey, ownerPublicKey, orePayerAccountName, options = {}) {
  options = {
    confirm: true,
    accountNamePrefix: 'ore',
    ...options
  };
  const oreAccountName = options.oreAccountName || await generateAccountName.bind(this)(options.accountNamePrefix);

  let transaction;
  if (options.confirm) {
    const awaitTransactionOptions = getAwaitTransactionOptions(options);
    transaction = await this.awaitTransaction(() => newAccountTransaction.bind(this)(oreAccountName, ownerPublicKey, activePublicKey, orePayerAccountName, options), awaitTransactionOptions);
  } else {
    transaction = await newAccountTransaction.bind(this)(oreAccountName, ownerPublicKey, activePublicKey, orePayerAccountName, options);
  }
  return { oreAccountName, transaction };
}

async function generateOreAccountAndEncryptedKeys(password, salt, ownerPublicKey, orePayerAccountName, options = {}) {
  const keys = await generateEncryptedKeys.bind(this)(password, salt, options.keys);

  const {
    oreAccountName,
    transaction
  } = await createOreAccountWithKeys.bind(this)(keys.publicKeys.active, ownerPublicKey, orePayerAccountName, options);

  return { oreAccountName, transaction, keys };
}

// Creates an account, without verifier auth keys
async function createAccount(password, salt, ownerPublicKey, orePayerAccountName, options = {}) {
  options = {
    broadcast: true,
    ...options
  };
  const { broadcast } = options;

  const {
    oreAccountName, transaction, keys
  } = await generateOreAccountAndEncryptedKeys.bind(this)(password, salt, ownerPublicKey, orePayerAccountName, options);

  return {
    oreAccountName,
    privateKey: keys.privateKeys.active,
    publicKey: keys.publicKeys.active,
    keys,
    transaction
  };
}

// returns a list of actions to link to an app permission
// every { contract, action } input pair is linked to the app permission
async function composeLinkActions(links, permission, authAccountName, authPermission) {
  const actions = [];
  links.forEach((link) => {
    const { code, type } = link;
    actions.push({
      account: 'eosio',
      name: 'linkauth',
      authorization: [{
        actor: authAccountName,
        permission: authPermission
      }],
      data: {
        account: authAccountName,
        code,
        type,
        requirement: permission
      }
    });
  });
  return actions;
}

/* Public */

// gets the account details from the chain network and checks if the account has a specific permission
async function checkIfAccountHasPermission(oreAccountName, permName) {
  const perms = await getAccountPermissions.bind(this)(oreAccountName);
  return !!(perms.find(perm => perm.perm_name === permName));
}

async function addPermission(authAccountName, keys, permissionName, parentPermission, options = {}) {
  options = {
    authPermission: 'active',
    ...options
  };
  const { authPermission, links = [], broadcast = true } = options;
  const perm = await appendPermission.bind(this)(authAccountName, keys, permissionName, parentPermission);
  const { perm_name: permission, parent, required_auth: auth } = perm;
  // add account permission
  const actions = [{
    account: 'eosio',
    name: 'updateauth',
    authorization: [{
      actor: authAccountName,
      permission: authPermission
    }],
    data: {
      account: authAccountName,
      permission,
      parent,
      auth
    }
  }];

  // add action permission for every { contract, action } pair passed in
  const linkActions = await composeLinkActions(links, permission, authAccountName, authPermission);
  const allActions = actions.concat(linkActions);

  return this.transact(allActions, broadcast);
}

// links actions for a given account to an app permission
async function linkActionsToPermission(links, permission, authAccountName, authPermission, broadcast = true) {
  const actions = await composeLinkActions(links, permission, authAccountName, authPermission);

  return this.transact(actions, broadcast);
}

// NOTE: When setting keys for `createKeyPair`, all keys are completely overriden, not just partially
async function createKeyPair(password, salt, authAccountName, permissionName, options = {}) {
  options = {
    confirm: true,
    parentPermission: 'active',
    keys: await generateEncryptedKeys.bind(this)(password, salt),
    ...options
  };

  const { keys, parentPermission } = options;

  if (options.confirm) {
    const awaitTransactionOptions = getAwaitTransactionOptions(options);
    await this.awaitTransaction(() => addPermission.bind(this)(authAccountName, [keys.publicKeys.active], permissionName, parentPermission, options), awaitTransactionOptions);
  } else {
    await addPermission.bind(this)(authAccountName, [keys.publicKeys.active], permissionName, parentPermission, options);
  }

  return keys;
}

async function createBridgeAccount(password, salt, authorizingAccount, options) {
  options = {
    oreAccountName: await generateAccountName.bind(this)(options.accountNamePrefix),
    confirm: true,
    ...options
  };

  let transaction;
  const keys = await generateEncryptedKeys.bind(this)(password, salt, options.keys);

  if (options.confirm) {
    const awaitTransactionOptions = getAwaitTransactionOptions(options);
    transaction = await this.awaitTransaction(() => this.createNewAccount(authorizingAccount, keys, options), awaitTransactionOptions);
  } else {
    transaction = await this.createNewAccount(authorizingAccount, keys, options);
  }

  return {
    oreAccountName: options.oreAccountName,
    privateKey: keys.privateKeys.active,
    publicKey: keys.publicKeys.active,
    keys,
    transaction
  };
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

// Recursively generates account names, until a uniq name is generated...
async function generateAccountName(prefix = '', checkIfNameUsedOnChain = true) {
  // NOTE: account names MUST be base32 encoded, and be 12 characters, in compliance with the EOS standard
  // NOTE: account names can also contain only the following characters: a-z, 1-5, & '.' In regex: [a-z1-5\.]{12}
  // NOTE: account names are generated based on the current unix timestamp + some randomness, and cut to be 12 chars
  const accountName = generateAccountNameString.bind(this)(prefix);
  let nameAlreadyExists = false;
  if (checkIfNameUsedOnChain) {
    nameAlreadyExists = await getNameAlreadyExists.bind(this)(accountName);
  }
  if (nameAlreadyExists) {
    return generateAccountName.bind(this)();
  }
  return accountName;
}

async function generateEncryptedKeys(password, salt, predefinedKeys = {}) {
  let keys = await Keygen.generateMasterKeys();
  const { publicKeys = {}, privateKeys = {} } = predefinedKeys;
  keys = {
    ...keys,
    publicKeys: {
      ...keys.publicKeys,
      ...publicKeys
    },
    privateKeys: {
      ...keys.privateKeys,
      ...privateKeys
    }
  };
  const encryptedKeys = encryptKeys.bind(this)(keys, password, salt);
  return encryptedKeys;
}

async function getNameAlreadyExists(accountName) {
  try {
    await this.eos.rpc.get_account(accountName);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  addPermission,
  checkIfAccountHasPermission,
  createKeyPair,
  createBridgeAccount,
  createOreAccount,
  eosBase32,
  generateAccountName,
  generateAccountNameString,
  generateEncryptedKeys,
  getNameAlreadyExists,
  linkActionsToPermission
};
