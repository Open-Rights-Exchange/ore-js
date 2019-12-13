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
module.exports = action;
