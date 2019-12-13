const action = ({ accountName, amount, contractName, createbridgeAccountName, memo, permission }) => (
  {
    account: contractName,
    name: 'transfer',
    authorization: [{
      actor: accountName,
      permission
    }],
    data: {
      from: accountName,
      to: createbridgeAccountName,
      quantity: amount,
      memo
    }
  }
);
module.exports = action;
