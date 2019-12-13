const action = ({ contractName, memo, fromAccountName, toAccountName, tokenAmount, permission }) => (
  {
    account: contractName,
    name: 'approve',
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
