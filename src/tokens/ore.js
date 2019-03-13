const CONTRACT_NAME = 'eosio.token';
const ORE_ORE_ACCOUNT_NAME = 'eosio';
const TOKEN_SYMBOL = 'ORE';
let amount;
/* Public */

function issueOre(toAccountName, oreAmount, memo = '') {
  amount = this.getAmount(oreAmount, TOKEN_SYMBOL);
  return this.issueToken(toAccountName, amount, ORE_ORE_ACCOUNT_NAME, CONTRACT_NAME, memo);
}

async function approveOre(fromAccountName, toAccountName, oreAmount, memo = '', permission = 'active') {
  amount = this.getAmount(oreAmount, TOKEN_SYMBOL);
  const fromAccountBalance = await this.getOreBalance(fromAccountName, TOKEN_SYMBOL, CONTRACT_NAME);
  if (fromAccountBalance > 0) {
    return this.approveTransfer(fromAccountName, toAccountName, amount, CONTRACT_NAME, memo, permission);
  }
  throw new Error('The account does not have sufficient balance');
}

function getOreBalance(oreAccountName) {
  return this.getBalance(oreAccountName, TOKEN_SYMBOL, CONTRACT_NAME);
}

function transferOre(fromAccountName, toAccountName, oreAmount, memo = '') {
  amount = this.getAmount(oreAmount, TOKEN_SYMBOL);
  return this.transferToken(fromAccountName, toAccountName, amount, CONTRACT_NAME, memo);
}

function transferOrefrom(approvedAccountName, fromAccountName, toAccountName, oreAmount, memo) {
  amount = this.getAmount(oreAmount, TOKEN_SYMBOL);
  return this.transferFrom(approvedAccountName, fromAccountName, toAccountName, amount, CONTRACT_NAME, memo);
}

module.exports = {
  issueOre,
  approveOre,
  getOreBalance,
  transferOre,
  transferOrefrom,
};
