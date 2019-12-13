const { ChainAction, composeAction } = require('./compose');

const RIGHT_CONTRACT_NAME = 'rights.ore';

function setRightsInRegistry(oreAccountName, rightData, broadcast = true) {
  // Enables the rights issuers add & modify rights, seperately from instruments
  // upsertright(account_name issuer, string &right_name, vector<ore_types::endpoint_url> urls, vector<account_name> issuer_whitelist)
  const { right_name, urls, issuer_whitelist } = rightData;

  const args = { contractName: RIGHT_CONTRACT_NAME, issuer_whitelist, oreAccountName, right_name, urls };
  const action = composeAction(ChainAction.Ore_UpsertRight, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

module.exports = {
  setRightsInRegistry
};
