const CONTRACT_NAME = 'eosio.token';
const ORE_ORE_ACCOUNT_NAME = 'eosio';
const TOKEN_SYMBOL = 'ORE';
let amount;
/* Public */

function issueOre(toAccountName, oreAmount, memo = '') {
  amount = this.getAmount(oreAmount, TOKEN_SYMBOL);
  return this.issueToken(toAccountName, amount, ORE_ORE_ACCOUNT_NAME, CONTRACT_NAME, memo);
}

function getOreBalance(oreAccountName) {
  return this.getBalance(oreAccountName, TOKEN_SYMBOL, CONTRACT_NAME);
}

function transferOre(fromAccountName, toAccountName, oreAmount, memo = '') {
  amount = this.getAmount(oreAmount, TOKEN_SYMBOL);
  return this.transferToken(fromAccountName, toAccountName, amount, CONTRACT_NAME, memo);
}

module.exports = {
  issueOre,
  getOreBalance,
  transferOre
};
