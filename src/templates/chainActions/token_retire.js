const action = ({ contractName, ownerAccountName, tokenAmount, memo, permission }) => (
  {
    account: contractName,
    name: 'retire',
    authorization: [{
      actor: ownerAccountName,
      permission
    }],
    data: {
      quantity: tokenAmount,
      memo
    }
  }
);
module.exports = action;
