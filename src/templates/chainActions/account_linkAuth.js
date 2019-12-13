const action = ({ authAccountName, authPermission, code, permission, type }) => (
  {
    account: 'eosio',
    name: 'linkauth',
    authorization: [{
      actor: authAccountName,
      permission: authPermission
    }],
    data: {
      account: authAccountName,
      code,
      type,
      requirement: permission
    }
  }
);
module.exports = action;
