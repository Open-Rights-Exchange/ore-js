const action = ({ accountName, appName, contractName, permission, symbol }) => (
  {
    account: contractName,
    name: 'reclaim',
    authorization: [{
      actor: accountName,
      permission
    }],
    data: {
      reclaimer: accountName,
      dapp: appName,
      sym: symbol
    }
  }
);
module.exports = action;
