const action = ({ authAccountName, authPermission, code, type }) => (
  {
    account: 'eosio',
    name: 'unlinkauth',
    authorization: [{
      actor: authAccountName,
      permission: authPermission
    }],
    data: {
      account: authAccountName,
      code,
      type
    }
  }
);
module.exports = action;
