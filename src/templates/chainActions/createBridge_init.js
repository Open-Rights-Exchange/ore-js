const action = ({ contractName, chainSymbol, newAccountContract, newAccountAction, minimumRAM, permission }) => (
  {
    account: contractName,
    name: 'init',
    authorization: [{
      actor: contractName,
      permission
    }],
    data: {
      symbol: chainSymbol,
      newaccountcontract: newAccountContract,
      newaccountaction: newAccountAction,
      minimumram: minimumRAM
    }
  }
);
export { action as default };
