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

function createToken(toAccountName, ownerAccountName, tokenAmount, contractName, permission = 'active') {
  return this.transact([{
    account: contractName,
    name: 'create',
    authorization: [{
      actor: ownerAccountName,
      permission,
    }],
    data: {
      issuer: toAccountName,
      maximum_supply: tokenAmount,
    },
  }]);
}

function issueToken(toAccountName, tokenAmount, ownerAccountName, contractName, memo = '', permission = 'active') {
  return this.transact([{
    account: contractName,
    name: 'issue',
    authorization: [{
      actor: ownerAccountName,
      permission,
    }],
    data: {
      to: toAccountName,
      quantity: tokenAmount,
      memo,
    },
  }]);
}

// cleos push action cpu.ore approve '[""]
function approveTransfer(fromAccountName, toAccountName, tokenAmount, contractName, memo = '', permission = 'active') {
  // Appprove some account to spend on behalf of approving account
  return this.transact([{
    account: contractName,
    name: 'approve',
    authorization: [{
      actor: fromAccountName,
      permission,
    }],
    data: {
      from: fromAccountName,
      to: toAccountName,
      quantity: tokenAmount,
      memo,
    },
  }]);
}

// cleos get table token.ore test1.apim allowances
async function getApprovedAccount(accountName, contractName) {
  // Returns all the accounts approved by the approving account
  const approvedAccounts = await this.eos.rpc.get_table_rows({
    code: contractName,
    json: true,
    scope: accountName,
    table: ALLOWANCE_TABLE,
    limit: -1,
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

// cleos get currency balance cpu.ore test1.apim CPU
async function getBalance(accountName, tokenSymbol, contractName) {
  const balance = await this.eos.rpc.get_currency_balance(contractName, accountName, tokenSymbol);
  if (balance && balance[0]) {
    return parseFloat(balance[0].split(tokenSymbol)[0]);
  }
  return parseFloat(0.0000);
}

function retireToken(ownerAccountName, tokenAmount, contractName, memo = '', permission = 'active') {
  return this.transact([{
    account: contractName,
    name: 'retire',
    authorization: [{
      actor: ownerAccountName,
      permission,
    }],
    data: {
      quantity: tokenAmount,
      memo,
    },
  }]);
}

// cleos push action cpu.ore transfer '["test1.apim", "test2.apim", "10.0000 CPU", "memo"]' -p test1.apim
function transferToken(fromAccountName, toAccountName, tokenAmount, contractName, memo = '', permission = 'active') {
  return this.transact([{
    account: contractName,
    name: 'transfer',
    authorization: [{
      actor: fromAccountName,
      permission,
    }],
    data: {
      from: fromAccountName,
      to: toAccountName,
      quantity: tokenAmount,
      memo,
    },
  }]);
}

// cleos push action cpu.ore transferFrom '["app.apim", "test1.apim", "test2.apim", "10.0000 CPU"]' -p app.apim
function transferFrom(approvedAccountName, fromAccountName, toAccountName, tokenAmount, contractName, memo = '', permission = 'active') {
  // Standard token transfer
  return this.transact([{
    account: contractName,
    name: 'transferFrom',
    authorization: [{
      actor: approvedAccountName,
      permission,
    }],
    data: {
      sender: approvedAccountName,
      from: fromAccountName,
      to: toAccountName,
      quantity: tokenAmount,
      memo,
    },
  }]);
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
  transferFrom,
};
