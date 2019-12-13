const action = ({ authAccountName, authPermission, permission }) => (
  {
    account: 'eosio',
    name: 'deleteauth',
    authorization: [{
      actor: authAccountName,
      permission: authPermission
    }],
    data: {
      account: authAccountName,
      permission
    }
  }
);
module.exports = action;
