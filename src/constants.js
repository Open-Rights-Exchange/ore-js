// sign transaction parameters
const TRANSACTION_EXPIRY_IN_SECONDS = 30;
const BLOCKS_BEHIND_REF_BLOCK = 3;
const TRANSACTION_ENCODING = 'utf8';

// transaction confirmation parameters
const BLOCKS_TO_CHECK = 20;
const CHECK_INTERVAL = 400;
const GET_BLOCK_ATTEMPTS = 10;

module.exports = {
  TRANSACTION_EXPIRY_IN_SECONDS,
  BLOCKS_BEHIND_REF_BLOCK,
  TRANSACTION_ENCODING,
  BLOCKS_TO_CHECK,
  CHECK_INTERVAL,
  GET_BLOCK_ATTEMPTS
};
