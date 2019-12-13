const action = ({ accountName, appName, contractName, permission, whitelistAccount }) => (
  {
    account: contractName,
    name: 'whitelist',
    authorization: [{
      actor: accountName,
      permission
    }],
    data: {
      owner: accountName,
      account: whitelistAccount,
      dapp: appName
    }
  }
);
module.exports = action;
