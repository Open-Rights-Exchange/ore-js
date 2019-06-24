const RIGHT_CONTRACT_NAME = 'rights.ore';

function setRightsInRegistry(oreAccountName, rightData, broadcast = true) {
  // Enables the rights issuers add & modify rights, seperately from instruments
  // upsertright(account_name issuer, string &right_name, vector<ore_types::endpoint_url> urls, vector<account_name> issuer_whitelist)
  const { right_name, urls, issuer_whitelist } = rightData;
  return this.transact([{
    account: RIGHT_CONTRACT_NAME,
    name: 'upsertright',
    authorization: [{
      actor: oreAccountName,
      permission: 'active'
    }],
    data: {
      issuer: oreAccountName,
      right_name,
      urls,
      issuer_whitelist
    }
  }], broadcast);
}

module.exports = {
  setRightsInRegistry
};
