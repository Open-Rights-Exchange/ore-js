/* Private */
const { Serialize, RpcError } = require('eosjs');
const ecc = require('eosjs-ecc');
const { BLOCKS_BEHIND_REF_BLOCK, BLOCKS_TO_CHECK, CHECK_INTERVAL, GET_BLOCK_ATTEMPTS, TRANSACTION_ENCODING, TRANSACTION_EXPIRY_IN_SECONDS } = require('./constants');
const { mapChainError } = require('./errors');
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

async function sendTransaction(func, confirm, awaitTransactionOptions) {
  let transaction;

  try {
    transaction = await func();
  } catch (error) {
    const errString = mapChainError(error);
    throw new Error(`Send Transaction Failure: ${errString}`);
  }

  if (confirm === true) {
    // get the chain's current head block number...
    const preCommitInfo = await getInfo.bind(this)();
    const preCommitHeadBlockNum = preCommitInfo.head_block_num;
    transaction = await awaitTransaction.bind(this)(transaction, awaitTransactionOptions, preCommitHeadBlockNum);
  }

  return transaction;
}

// Polls the chain until it finds a block that includes the specific transaction
// Useful when committing sequential transactions with inter-dependencies (must wait for the first one to commit before submitting the next one)
// transactionResponse: The response body from submitting the transaction to the chain (includes transaction Id and most recent chain block number)
// blocksToCheck = the number of blocks to check, after committing the transaction, before giving up
// checkInterval = the time between block checks in MS
// getBlockAttempts = the number of failed attempts at retrieving a particular block, before giving up
// NOTE: This does NOT confirm that the transaction is irreversible, aka finalized

function awaitTransaction(transactionResponse, options = {}, preCommitHeadBlockNum) {
  const { blocksToCheck = BLOCKS_TO_CHECK, checkInterval = CHECK_INTERVAL, getBlockAttempts: maxBlockReadAttempts = GET_BLOCK_ATTEMPTS } = options;

  return new Promise(async (resolve, reject) => {
    let getBlockAttempt = 1;
    // use the chain's current head block number...
    if (!preCommitHeadBlockNum) {
      // WARNING - This code can cause false await error messages since the head block retrieved below might be after the transaction's block
      // the head block should be retrieved before sending the transaction and passed-in to this function
      // This workaround is included for backawards compatibility
      const preCommitInfo = await getInfo.bind(this)();
      preCommitHeadBlockNum = preCommitInfo.head_block_num;
    }

    const { processed, transaction_id: transactionId } = transactionResponse || {};
    // starting block number should be the block number in the transaction receipt. If block number not in transaction, use preCommitHeadBlockNum
    const { block_num = preCommitHeadBlockNum } = processed || {};
    const startingBlockNumToCheck = block_num - 1;

    let blockNumToCheck = startingBlockNumToCheck;
    let inProgress = false;

    // Keep reading blocks from the chain (every checkInterval) until we find the transationId in a block
    // ... or until we reach a max number of blocks or block read attempts
    const timer = setInterval(async () => {
      try {
        if (inProgress) return;
        inProgress = true;
        const possibleTransactionBlock = await this.eos.rpc.get_block(blockNumToCheck);
        const blockHasTransaction = await hasTransaction(possibleTransactionBlock, transactionId);
        if (blockHasTransaction) {
          resolveAwaitTransaction(resolve, timer, transactionResponse);
        }
        blockNumToCheck += 1;
        inProgress = false;
      } catch (error) {
        inProgress = false;
        const mappedError = mapChainError(error);
        if (mappedError.name === 'BlockDoesNotExist') {
          // Try to read the specific block - up to getBlockAttempts times
          if (getBlockAttempt >= maxBlockReadAttempts) {
            rejectAwaitTransaction(reject, timer, 'maxBlockReadAttemptsTimeout', `Await Transaction Failure: Failure to find a block, after ${getBlockAttempt} attempts to check block ${blockNumToCheck}.`);
            return;
          }
          getBlockAttempt += 1;
        } else {
          // re-throw error - not one we can handle here
          throw mappedError;
        }
      }
      if (blockNumToCheck > startingBlockNumToCheck + blocksToCheck) {
        inProgress = false;
        rejectAwaitTransaction(reject, timer, 'maxBlocksTimeout', `Await Transaction Timeout: Waited for ${blocksToCheck} blocks ~(${(checkInterval / 1000) * blocksToCheck} seconds) starting with block num: ${startingBlockNumToCheck}. This does not mean the transaction failed just that the transaction wasn't found in a block before timeout`);
      }
    }, checkInterval);
  });
}

function resolveAwaitTransaction(resolve, timer, transaction) {
  clearInterval(timer);
  resolve(transaction);
}

function rejectAwaitTransaction(reject, timer, errorName, errorMessage) {
  clearInterval(timer);
  const error = new Error(errorMessage);
  error.name = errorName;
  reject(error);
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
  checkPubKeytoAccount,
  createSignBuffer,
  getAllTableRows,
  hasTransaction,
  hexToUint8Array: Serialize.hexToUint8Array,
  isValidPublicKey,
  pushSignedTransaction,
  recoverPublicKeyFromSignature,
  sendTransaction,
  serializeTransaction,
  deserializeTransaction,
  signRawTransaction,
  signSerializedTransactionBuffer,
  transact
};
