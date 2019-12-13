const action = ({ contractName, issuer_whitelist, oreAccountName, right_name, urls }) => (
  {
    account: contractName,
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
  }
);
export { action as default };
