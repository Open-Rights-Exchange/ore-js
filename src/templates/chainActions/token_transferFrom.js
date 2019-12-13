const action = ({ approvedAccountName, contractName, fromAccountName, toAccountName, tokenAmount, memo, permission }) => (
  {
    account: contractName,
    name: 'transferFrom',
    authorization: [{
      actor: approvedAccountName,
      permission
    }],
    data: {
      sender: approvedAccountName,
      from: fromAccountName,
      to: toAccountName,
      quantity: tokenAmount,
      memo
    }
  }
);
module.exports = action;
