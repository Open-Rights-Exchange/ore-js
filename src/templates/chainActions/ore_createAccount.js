const action = ({ activePublicKey, name, orePayerAccountName, ownerPublicKey, permission, pricekey, referral }) => (
  {
    account: 'system.ore',
    name: 'createoreacc',
    authorization: [{
      actor: orePayerAccountName,
      permission
    }],
    data: {
      creator: orePayerAccountName,
      newname: name, // Some versions of the system contract are running a different version of the newaccount code
      ownerkey: ownerPublicKey,
      activekey: activePublicKey,
      pricekey,
      referral
    }
  }
);
module.exports = action;
