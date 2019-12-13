const action = ({ accountName, activekey, contractName, oreAccountName, origin, ownerkey, permission, referral }) => (
  {
    account: contractName,
    name: 'create',
    authorization: [{
      actor: accountName,
      permission
    }],
    data: {
      memo: accountName,
      account: oreAccountName,
      ownerkey,
      activekey,
      origin,
      referral
    }
  }
);
export { action as default };
