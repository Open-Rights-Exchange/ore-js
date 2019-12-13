const action = ({ contractName, ownerAccountName, toAccountName, tokenAmount, permission }) => (
  {
    account: contractName,
    name: 'create',
    authorization: [{
      actor: ownerAccountName,
      permission
    }],
    data: {
      issuer: toAccountName,
      maximum_supply: tokenAmount
    }
  }
);
export { action as default };
