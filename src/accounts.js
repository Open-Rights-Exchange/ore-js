const { Keygen } = require('eosjs-keygen');

const ACCOUNT_NAME_MAX_LENGTH = 12;
const BASE = 31; // Base 31 allows us to leave out '.', as it's used for account scope

/* Private */

function newAccountTransaction(name, ownerPublicKey, activePublicKey, orePayerAccountName, options = {}) {
  options = Object.assign({
    bytes: 8192,
    stakedNet: 1,
    stakedCpu: 1,
    transfer: false,
    tokenSymbol: 'SYS'
  }, options);

  let actions = [{
    account: 'eosio',
    name: 'newaccount',
    authorization: [{
      actor: orePayerAccountName,
      permission: 'active',
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
      permission: 'active',
    }],
    data: {
      payer: orePayerAccountName,
      receiver: name,
      bytes: options.bytes,
    },
  },
  {
    account: 'eosio',
    name: 'delegatebw',
    authorization: [{
      actor: orePayerAccountName,
      permission: 'active',
    }],
    data: {
      from: orePayerAccountName,
      receiver: name,
      stake_net_quantity: `${options.stakedNet}.0000 ${options.tokenSymbol}`,
      stake_cpu_quantity: `${options.stakedCpu}.0000 ${options.tokenSymbol}`,
      transfer: options.transfer,
    },
  }];
  return this.transact(actions);
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

function generateAccountName() {
  // NOTE: account names MUST be base32 encoded, and be 12 characters, in compliance with the EOS standard
  // NOTE: account names can also contain only the following characters: a-z, 1-5, & '.' In regex: [a-z1-5\.]{12}
  // NOTE: account names are generated based on the current unix timestamp + some randomness, and cut to be 12 chars
  return (timestampEosBase32() + randomEosBase32()).substr(0, 12);
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

async function addAuthPermission(oreAccountName, keys, permName, code, type) {
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

  return this.transact(actions);
}

async function generateAuthKeys(oreAccountName, permName, code, action) {
  const authKeys = await Keygen.generateMasterKeys();
  await addAuthPermission.bind(this)(oreAccountName, [authKeys.publicKeys.active], permName, code, action);
  return authKeys;
}

async function createOreAccountWithKeys(activePublicKey, ownerPublicKey, orePayerAccountName, options = {}, confirm = false) {
  // TODO: Make sure the account name does not already exist!
  const oreAccountName = options.oreAccountName || generateAccountName();
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

  // TODO Check for existing wallets, for name collisions
  const {
    oreAccountName,
    transaction,
  } = await createOreAccountWithKeys.bind(this)(keys.publicKeys.active, ownerPublicKey, orePayerAccountName, options, true);

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

async function createOreAccount(password, salt, ownerPublicKey, orePayerAccountName, options = {}) {
  const {
    encryptedKeys, oreAccountName, transaction,
  } = await generateOreAccountAndEncryptedKeys.bind(this)(password, salt, ownerPublicKey, orePayerAccountName, options);
  const verifierAuthKeys = await generateAuthKeys.bind(this)(oreAccountName, 'authverifier', 'token.ore', 'approve');

  return {
    verifierAuthKey: verifierAuthKeys.privateKeys.active,
    verifierAuthPublicKey: verifierAuthKeys.publicKeys.active,
    oreAccountName,
    privateKey: encryptedKeys.privateKeys.active,
    publicKey: encryptedKeys.publicKeys.active,
    transaction,
  };
}

async function createEosAccount(password, salt, ownerPublicKey, orePayerAccountName, options = {}) {
  // NOTE: Does not currently include the verifier auth keys
  Object.assign(options, {tokenSymbol: 'EOS'});

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

module.exports = {
  createEosAccount,
  createOreAccount,
  eosBase32,
};
