/* Public */
const { ChainAction, composeAction } = require('./compose');
// Initializes createbridge with the following details:
// Only the createbridge account can call this action
// symbol               = the core token of the chain or the token used to pay for new user accounts of the chain
// precision            = precision of the core token of the chain
// newAccountContract   = the contract to call for new account action
// minimumRAM           = minimum bytes of RAM to put in a new account created on the chain
function init(symbol, precision, newAccountContract, newAccountAction, minimumRAM, options) {
  const { contractName = 'createbridge', permission = 'active', broadcast = true } = options;
  const chainSymbol = `${precision},${symbol}`;

  const args = { contractName, chainSymbol, newAccountContract, newAccountAction, minimumRAM, permission };
  const action = composeAction(ChainAction.CreateBridge_init, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

// Registers an app with the createbridge contract. Called with the following parameter:
// authorizingAccount       = an object with account name and permission to be registered as the owner of the app
// appName:                 = the string/account name representing the app
// ram:                     = bytes of ram to put in the new user account created for the app (defaults to 4kb)
// net                      = amount to be staked for net
// cpu                      = amount to be staked for cpu
// airdropContract          = name of the airdrop contract
// airdropToken             = total number of tokens to be airdropped
// airdroplimit             = number of tokens to be airdropped to the newly created account
function define(authorizingAccount, appName, ram = 4096, net, cpu, pricekey, options) {
  const { airdropContract, airdropToken, airdropLimit, contractName = 'createbridge', broadcast = true } = options;
  const { accountName, permission = 'active' } = authorizingAccount;
  const airdrop = {
    contract: airdropContract,
    tokens: airdropToken,
    limit: airdropLimit
  };

  const args = { accountName, airdrop, appName, contractName, cpu, permission, net, pricekey, ram };
  const action = composeAction(ChainAction.CreateBridge_Define, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

// Creates a new user account. It also airdrops custom dapp tokens to the new user account if an app owner has opted for airdrops
// authorizingAccount = an object with account name and permission of the account paying for the balance left after getting the donation from the app contributors
// keys               = owner key and active key for the new account
// origin             = the string representing the app to create the new user account for. For ex- everipedia.org, lumeos
function createNewAccount(authorizingAccount, keys, options) {
  const { accountName, permission } = authorizingAccount;
  const { origin, oreAccountName, contractName = 'createbridge', broadcast = true, referral = '' } = options;

  const { active: activekey, owner: ownerkey } = keys.publicKeys;
  const args = { accountName, activekey, contractName, oreAccountName, origin, ownerkey, permission, referral };
  const action = composeAction(ChainAction.CreateBridge_Create, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

// Owner account of an app can whitelist other accounts.
// authorizingAccount   = an object with account name and permission contributing towards an app
// whitelistAccount     = account name to be whitelisted to create accounts on behalf of the app
function whitelist(authorizingAccount, whitelistAccount, appName, options) {
  const { contractName = 'createbridge', broadcast = true } = options;
  const { accountName, permission = 'active' } = authorizingAccount;

  const args = { accountName, appName, contractName, permission, whitelistAccount };
  const action = composeAction(ChainAction.CreateBridge_Whitelist, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

// Contributes to account creation for an app by transferring the amount to createbridge with the app name in the memo field
// authorizingAccount   = an object with account name and permission contributing towards an app
// appName       = name of the app to contribute
// amount        = amount to contribute
// ramPercentage = RAM% per account the contributor wants to subsidize
// totalAccounts = max accounts that can be created with the provided contribution (optional)
function transfer(authorizingAccount, appName, amount, ramPercentage, totalAccounts = -1, options) {
  const { contractName = 'eosio.token', createbridgeAccountName = 'createbridge', broadcast = true } = options;
  const { accountName, permission = 'active' } = authorizingAccount;
  const memo = `${appName},${ramPercentage},${totalAccounts}`;

  const args = { accountName, amount, contractName, createbridgeAccountName, memo, permission };
  const action = composeAction(ChainAction.CreateBridge_Transfer, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

// Transfers the remaining balance of a contributor from createbridge back to the contributor
// authorizingAccount = an object with account name and permission trying to reclaim the balance
// appName    = the app name for which the account is trying to reclaim the balance
// symbol     = symbol of the tokens to be reclaimed.
function reclaim(authorizingAccount, appName, symbol, options) {
  const { contractName = 'createbridge', broadcast = true } = options;
  const { accountName, permission = 'active' } = authorizingAccount;

  const args = { accountName, appName, contractName, permission, symbol };
  const action = composeAction(ChainAction.CreateBridge_Reclaim, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

module.exports = {
  init,
  createNewAccount,
  define,
  whitelist,
  transfer,
  reclaim
};
