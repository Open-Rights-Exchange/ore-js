const { ChainAction, composeAction } = require('./compose');

const TABLE_NAME = 'accounts';
const ALLOWANCE_TABLE = 'allowances';

/* Public */
function getAmount(tokenAmount, tokenSymbol) {
  try {
    if (typeof tokenAmount === 'number') {
      const amount = parseFloat(tokenAmount).toFixed(4);
      return `${amount.toString()} ${tokenSymbol}`;
    }
    if (typeof tokenAmount === 'string') {
      if (tokenAmount.split(' ')[1] === tokenSymbol) {
        return tokenAmount;
      }

      return `${parseFloat(tokenAmount).toFixed(4).toString()} ${tokenSymbol}`;
    }
    throw new Error('not a valid token amount');
  } catch (e) {
    return e;
  }
}

function createToken(toAccountName, ownerAccountName, tokenAmount, contractName, permission = 'active', broadcast = true) {
  const args = { contractName, ownerAccountName, toAccountName, tokenAmount, permission };
  const action = composeAction(ChainAction.Token_Create, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

function issueToken(toAccountName, tokenAmount, ownerAccountName, contractName, memo = '', permission = 'active', broadcast = true) {
  const args = { contractName, ownerAccountName, toAccountName, tokenAmount, memo, permission };
  const action = composeAction(ChainAction.Token_Issue, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

// cleos push action cpu.ore approve '[""]
function approveTransfer(fromAccountName, toAccountName, tokenAmount, contractName, memo = '', permission = 'active', broadcast = true) {
  // Appprove some account to spend on behalf of approving account
  const args = { contractName, memo, fromAccountName, toAccountName, tokenAmount, permission };
  const action = composeAction(ChainAction.Token_Approve, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

// cleos get table token.ore test1.acnt allowances
async function getApprovedAccount(accountName, contractName) {
  // Returns all the accounts approved by the approving account
  const approvedAccounts = await this.eos.rpc.get_table_rows({
    code: contractName,
    json: true,
    scope: accountName,
    table: ALLOWANCE_TABLE,
    limit: -1
  });
  return approvedAccounts.rows;
}

async function getApprovedAmount(fromAccount, toAccount, tokenSymbol, contractName) {
  // Returns the amount approved by the fromAccount for toAccount
  let approvedAmount = 0;
  const approvedAccounts = await this.getApprovedAccount.bind(this)(fromAccount, contractName);
  approvedAccounts.filter((obj) => {
    if (obj.to === toAccount) {
      approvedAmount = obj.quantity;
    }
    return approvedAmount;
  });
  return this.getAmount(approvedAmount, tokenSymbol);
}

// cleos get currency balance cpu.ore test1.acnt CPU
async function getBalance(accountName, tokenSymbol, contractName) {
  const balance = await this.eos.rpc.get_currency_balance(contractName, accountName, tokenSymbol);
  if (balance && balance[0]) {
    return parseFloat(balance[0].split(tokenSymbol)[0]);
  }
  return parseFloat(0.0000);
}

function retireToken(ownerAccountName, tokenAmount, contractName, memo = '', permission = 'active', broadcast = true) {

  const args = { contractName, ownerAccountName, tokenAmount, memo, permission };
  const action = composeAction(ChainAction.Token_Retire, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

// cleos push action cpu.ore transfer '["test1.acnt", "test2.acnt", "10.0000 CPU", "memo"]' -p test1.acnt
function transferToken(fromAccountName, toAccountName, tokenAmount, contractName, memo = '', permission = 'active', broadcast = true) {

  const args = { contractName, fromAccountName, toAccountName, tokenAmount, memo, permission };
  const action = composeAction(ChainAction.Token_Transfer, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

// cleos push action cpu.ore transferFrom '["app.acnt", "test1.acnt", "test2.acnt", "10.0000 CPU"]' -p app.acnt
function transferFrom(approvedAccountName, fromAccountName, toAccountName, tokenAmount, contractName, memo = '', permission = 'active', broadcast = true) {

  const args = { approvedAccountName, contractName, fromAccountName, toAccountName, tokenAmount, memo, permission };
  const action = composeAction(ChainAction.Token_TransferFrom, args);
  const actions = [action];

  return this.transact(actions, broadcast);
}

module.exports = {
  approveTransfer,
  createToken,
  getAmount,
  getApprovedAccount,
  getApprovedAmount,
  getBalance,
  issueToken,
  retireToken,
  transferToken,
  transferFrom
};
