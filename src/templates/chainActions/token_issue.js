const action = ({ contractName, ownerAccountName, toAccountName, tokenAmount, memo, permission }) => (
  {
    account: contractName,
    name: 'issue',
    authorization: [{
      actor: ownerAccountName,
      permission
    }],
    data: {
      to: toAccountName,
      quantity: tokenAmount,
      memo
    }
  }
);
module.exports = action;
