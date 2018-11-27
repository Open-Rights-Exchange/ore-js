/* Public */

function hasTransaction(block, transactionId) {
  if (block.transactions) {
    const result = block.transactions.find(transaction => transaction.trx.id === transactionId);
    if (result !== undefined) {
      return true;
    }
  }
  return false;
}

// NOTE: Use this to await for transactions to be added to a block
// NOTE: Useful, when committing sequential transactions with inter-dependencies
// NOTE: This does NOT confirm that the transaction is irreversible, aka finalized
// NOTE: blocksToCheck = the number of blocks to check, after committing the transaction, before giving up
// NOTE: checkInterval = the time between block checks in MS
// NOTE: getBlockAttempts = the number of failed attempts at retrieving a particular block, before giving up
function awaitTransaction(func, blocksToCheck = 12, checkInterval = 400, getBlockAttempts = 5) {
  return new Promise(async (resolve, reject) => {
    // check the current head block num...
    const preCommitInfo = await this.eos.rpc.get_info({});
    const preCommitHeadBlockNum = preCommitInfo.head_block_num;
    // make the transaction...
    const transaction = await func();
    // keep checking for the transaction in future blocks...
    let blockNumToCheck = preCommitHeadBlockNum + 1;
    let blockToCheck;
    let getBlockAttempt = 1;
    const intConfirm = setInterval(async () => {
      try {
        blockToCheck = await this.eos.rpc.get_block(blockNumToCheck);
        if (hasTransaction(blockToCheck, transaction.transaction_id)) {
          clearInterval(intConfirm);
          resolve(transaction);
        }
        getBlockAttempt = 1;
        blockNumToCheck += 1;
      } catch (error) {
        if (getBlockAttempt >= getBlockAttempts) {
          clearInterval(intConfirm);
          reject(new Error(`Await Transaction Failure: Failure to find a block, after ${getBlockAttempt} attempts to check block ${blockNumToCheck}.`));
        }
        getBlockAttempt += 1;
      }
      if (blockNumToCheck > preCommitHeadBlockNum + blocksToCheck) {
        clearInterval(intConfirm);
        reject(new Error(`Await Transaction Timeout: Waited for ${blocksToCheck} blocks ~(${blocksToCheck / 2} seconds) starting with block num: ${preCommitHeadBlockNum}. This does not mean the transaction failed just that the transaction wasn't found in a block before timeout`));
      }
    }, checkInterval);
  });
}

async function getAllTableRows(params, key_field = 'id', json = true) {
  let results = [];
  const lowerBound = 0;
  // const upperBound = -1;
  const limit = -1;
  const parameters = {
    ...params,
    json,
    lower_bound: params.lower_bound || lowerBound,
    scope: params.scope || params.code,
    limit: params.limit || limit,
  };
  results = await this.eos.rpc.get_table_rows(parameters);
  return results.rows;
}

// check if the publickey belongs to the account provided
async function checkPubKeytoAccount(account, publicKey) {
  const keyaccounts = await this.eos.history_get_key_accounts(publicKey);
  const accounts = await keyaccounts.account_names;

  if (accounts.includes(account)) {
    return true;
  }
  return false;
}

function transact(actions, blocksBehind = 3, expireSeconds = 30) {
  return this.eos.transact({ actions }, {
    blocksBehind,
    expireSeconds,
  });
}

module.exports = {
  awaitTransaction,
  getAllTableRows,
  hasTransaction,
  checkPubKeytoAccount,
  transact,
};
