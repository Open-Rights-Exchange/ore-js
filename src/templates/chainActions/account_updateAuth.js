const action = ({ auth, authAccountName, authPermission, parent, permission }) => (
  {
    account: 'eosio',
    name: 'updateauth',
    authorization: [{
      actor: authAccountName,
      permission: authPermission
    }],
    data: {
      account: authAccountName,
      permission,
      parent,
      auth
    }
  }
);
module.exports = action;
