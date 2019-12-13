const action = ({ contractName, fromAccountName, toAccountName, tokenAmount, memo, permission }) => (
  {
    account: contractName,
    name: 'transfer',
    authorization: [{
      actor: fromAccountName,
      permission
    }],
    data: {
      from: fromAccountName,
      to: toAccountName,
      quantity: tokenAmount,
      memo
    }
  }
);
export { action as default };
