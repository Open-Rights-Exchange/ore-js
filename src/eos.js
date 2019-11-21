/* Private */
const { RpcError } = require('eosjs');
const ecc = require('eosjs-ecc');
const { BLOCKS_BEHIND_REF_BLOCK, BLOCKS_TO_CHECK, CHECK_INTERVAL, GET_BLOCK_ATTEMPTS, TRANSACTION_ENCODING, TRANSACTION_EXPIRY_IN_SECONDS } = require('./constants');
// NOTE: More than a simple wrapper for eos.rpc.get_info
// NOTE: Saves state from get_info, which can be used by other methods
// NOTE: For example, newaccount will have different field names, depending on the server_version_string
async function getInfo() {
  const info = await this.eos.rpc.get_info({});
  this.chainInfo = info;
  return info;
}

/* Public */

async function hasTransaction(block, transactionId) {
  if (block.transactions) {
    const result = block.transactions.find(transaction => transaction.trx.id === transactionId);
    if (result !== undefined) {
      return true;
    }
  }
  return false;
}

async function getChainId() {
  const { chain_id: chainId = null } = await getInfo.bind(this)();
  return chainId;
}

// NOTE: Use this to await for transactions to be added to a block
// NOTE: Useful, when committing sequential transactions with inter-dependencies
// NOTE: This does NOT confirm that the transaction is irreversible, aka finalized
// NOTE: blocksToCheck = the number of blocks to check, after committing the transaction, before giving up
// NOTE: checkInterval = the time between block checks in MS
// NOTE: getBlockAttempts = the number of failed attempts at retrieving a particular block, before giving up
function awaitTransaction(func, options = {}) {
  const { blocksToCheck = BLOCKS_TO_CHECK, checkInterval = CHECK_INTERVAL, getBlockAttempts = GET_BLOCK_ATTEMPTS } = options;
  let startingBlockNumToCheck;
  let blockNumToCheck;

  return new Promise(async (resolve, reject) => {
    // check the current head block num...
    const preCommitInfo = await getInfo.bind(this)();
    const preCommitHeadBlockNum = preCommitInfo.head_block_num;
    // make the transaction...
    let transaction;
    try {
      transaction = await func();
      const { processed } = transaction || {};
      // starting block number should be the block number in the transaction reciept. If block number not in transaction, use preCommitHeadBlockNum
      const { block_num = preCommitHeadBlockNum } = processed || {};
      startingBlockNumToCheck = block_num - 1;
    } catch (error) {
      let errString = '';

      if (error instanceof RpcError) {
        errString = JSON.stringify(error.json);
      } else {
        errString = JSON.stringify(error);
      }

      reject(new Error(`Await Transaction Failure: ${errString}`));
    }
    // keep checking for the transaction in future blocks...
    let blockToCheck;
    let getBlockAttempt = 1;
    let blockHasTransaction = false;
    blockNumToCheck = startingBlockNumToCheck;
    const intConfirm = setInterval(async () => {
      try {
        blockToCheck = await this.eos.rpc.get_block(blockNumToCheck);
        blockHasTransaction = await hasTransaction(blockToCheck, transaction.transaction_id);
        if (blockHasTransaction) {
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
      if (blockNumToCheck > startingBlockNumToCheck + blocksToCheck) {
        clearInterval(intConfirm);
        reject(new Error(`Await Transaction Timeout: Waited for ${blocksToCheck} blocks ~(${(checkInterval / 1000) * blocksToCheck} seconds) starting with block num: ${startingBlockNumToCheck}. This does not mean the transaction failed just that the transaction wasn't found in a block before timeout`));
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
    limit: params.limit || limit
  };
  results = await this.eos.rpc.get_table_rows(parameters);
  return results.rows;
}

// check if the publickey belongs to the account provided
async function checkPubKeytoAccount(account, publicKey) {
  const keyaccounts = await this.eos.rpc.history_get_key_accounts(publicKey);
  const accounts = await keyaccounts.account_names;

  if (accounts.includes(account)) {
    return true;
  }
  return false;
}

// NOTE: setting the broadcast parameter to false allows us to receive signed transactions, without submitting them
function transact(actions, broadcast = true, blocksBehind = BLOCKS_BEHIND_REF_BLOCK, expireSeconds = TRANSACTION_EXPIRY_IN_SECONDS) {
  return this.eos.transact({
    actions
  }, {
    blocksBehind,
    broadcast,
    expireSeconds
  });
}

function serializeTransaction(transaction, transactionOptions = {}) {
  const { blocksBehind = BLOCKS_BEHIND_REF_BLOCK, expireSeconds = TRANSACTION_EXPIRY_IN_SECONDS, broadcast = false, sign = false } = transactionOptions;

  const options = {
    blocksBehind,
    expireSeconds,
    broadcast,
    sign
  };

  return this.eos.transact(transaction, options);
}

function deserializeTransaction(serializedTransaction) {
  return this.eos.deserializeTransaction(serializedTransaction);
}

async function createSignBuffer(serializedTransaction) {
  const chainId = await getChainId.bind(this)();

  return Buffer.concat([
    Buffer.from(chainId, 'hex'),
    Buffer.from(serializedTransaction),
    Buffer.from(new Uint8Array(32))
  ]);
}

function signSerializedTransactionBuffer(signBuffer, privateKey, encoding = TRANSACTION_ENCODING) {
  return ecc.sign(signBuffer, privateKey).toString();
}

function isValidPublicKey(publicKey) {
  return ecc.isValidPublic(publicKey);
}

function recoverPublicKeyFromSignature(signBuffer, transaction, encoding = TRANSACTION_ENCODING) {
  return ecc.recover(signBuffer, transaction);
}

async function signRawTransaction(transaction, transactionOptions = {}, privateKey, additionalSignatures = []) {
  const serializedTrx = await serializeTransaction.bind(this)(transaction, transactionOptions);
  const { serializeTransaction } = serializedTrx;
  const signBuf = await createSignBuffer.bind(this)(serializeTransaction);
  const signature = await signSerializedTransactionBuffer(signBuf, privateKey);
  const signedTrx = {};
  signedTrx.signatures = [];
  signedTrx.signatures.push(signature);

  signedTrx.serializedTransaction = serializedTrx.serializedTransaction;
  if (additionalSignatures.length > 0) {
    signedTrx.signatures.concat(additionalSignatures);
  }
  return signedTrx;
}

function pushSignedTransaction(signedTransaction) {
  return this.eos.pushSignedTransaction(signedTransaction);
}

module.exports = {
  awaitTransaction,
  checkPubKeytoAccount,
  createSignBuffer,
  getAllTableRows,
  hasTransaction,
  isValidPublicKey,
  pushSignedTransaction,
  recoverPublicKeyFromSignature,
  serializeTransaction,
  deserializeTransaction,
  signRawTransaction,
  signSerializedTransactionBuffer,
  transact
};
