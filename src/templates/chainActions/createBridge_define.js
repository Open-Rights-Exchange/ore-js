const action = ({ accountName, airdrop, appName, contractName, cpu, permission, net, pricekey, ram }) => (
  {
    account: contractName,
    name: 'define',
    authorization: [{
      actor: accountName,
      permission
    }],
    data: {
      owner: accountName,
      dapp: appName,
      ram_bytes: ram,
      net,
      cpu,
      pricekey,
      airdrop
    }
  }
);
module.exports = action;
