const CONTRACT_NAME = 'token.ore';
const ORE_CPU_ACCOUNT_NAME = 'cpu.ore';
const TOKEN_SYMBOL = 'CPU';

let amount;
/* Public */

function issueCpu(toAccountName, cpuAmount, memo = '') {
  amount = this.getAmount(cpuAmount, TOKEN_SYMBOL);
  return this.issueToken(toAccountName, amount, ORE_CPU_ACCOUNT_NAME, CONTRACT_NAME, memo);
}

async function approveCpu(fromAccountName, toAccountName, cpuAmount, memo = '', permission = 'active') {
  amount = this.getAmount(cpuAmount, TOKEN_SYMBOL);
  const fromAccountBalance = await this.getCpuBalance(fromAccountName, TOKEN_SYMBOL, CONTRACT_NAME);
  if (fromAccountBalance > 0) {
    return this.approveTransfer(fromAccountName, toAccountName, amount, CONTRACT_NAME, memo, permission);
  }
  throw new Error('The account does not have sufficient balance');
}

async function getApprovedCpuBalance(fromAccountName, toAccountName) {
  const approvedBalance = await this.getApprovedAmount.bind(this)(fromAccountName, toAccountName, TOKEN_SYMBOL, CONTRACT_NAME);
  return approvedBalance;
}

function getCpuBalance(oreAccountName) {
  return this.getBalance(oreAccountName, TOKEN_SYMBOL, CONTRACT_NAME);
}

function transferCpu(fromAccountName, toAccountName, cpuAmount, memo = '') {
  amount = this.getAmount(cpuAmount, TOKEN_SYMBOL);
  return this.transferToken(fromAccountName, toAccountName, amount, CONTRACT_NAME, memo);
}

function transferCpufrom(approvedAccountName, fromAccountName, toAccountName, cpuAmount, memo) {
  amount = this.getAmount(cpuAmount, TOKEN_SYMBOL);
  return this.transferFrom(approvedAccountName, fromAccountName, toAccountName, amount, CONTRACT_NAME, memo);
}

export default {
  issueCpu,
  approveCpu,
  getCpuBalance,
  getApprovedCpuBalance,
  transferCpu,
  transferCpufrom
};
