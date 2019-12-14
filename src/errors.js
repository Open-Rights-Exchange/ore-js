/* eslint-disable no-restricted-syntax */
const { RpcError } = require('eosjs');
const { stringifySafe } = require('./helpers');

// subset of errors from EOS chain - https://github.com/EOSIO/eos/blob/master/libraries/chain/include/eosio/chain/exceptions.hpp
// IMPORTANT: These are in order of importance
// ... keep the Misc.. errors at the bottom - they catch the categories if not caught by a more specific error higher up
const ChainError = {
  AccountCreationFailedAlreadyExists: 'account_name_exists_exception',
  AuthUnsatisfied: 'unsatisfied_authorization', // all permission or keys needed for transaction weren't provided
  AuthMissing: 'missing_auth_exception', // missing permission or key
  BlockDoesNotExist: 'unknown_block_exception',
  TxExceededResources: '_exceeded', // includes all EOS resources
  PermissionAlreadyLinked: 'Attempting to update required authority, but new requirement is same as old',
  PermissionNotLinked: 'Attempting to unlink authority, but no link found',
  PermissionDeleteFailedInUse: '(Cannot delete a linked authority. Unlink the authority first|Cannot delete active authority|Cannot delete owner authority)',
  MiscChainError: 'chain_type_exception',
  MiscBlockValidationError: 'block_validate_exception',
  MiscTransactionError: 'transaction_exception',
  MiscActionValidationError: 'action_validate_exception',
  MiscContractError: 'contract_exception',
  MiscDatabaseError: 'database_exception',
  MiscBlockProducerError: 'producer_exception',
  MiscWhitelistBlackListError: 'whitelist_blacklist_exception',
  MiscNodeError: '(misc_exception|plugin_exception|wallet_exception|abi_exception|reversible_blocks_exception|block_log_exception|contract_api_exception|protocol_feature_exception|mongo_db_exception)',
  UnknownError: '(.*)' // matches anything - this is the catch all if nothing else matches
};

// Maps an Error object (thrown by a call to the chain) into a known set of errors
function mapError(error) {
  let errorSearchString;
  let errorMessage;
  let newError;

  if (error instanceof RpcError) {
    errorSearchString = `${error.name} ${error.message} ${stringifySafe(error.json)}`; // includes the full body of the response from the HTTP request to the chain
    errorMessage = `${stringifySafe(error.json)}`;
  } else if (error instanceof Error) {
    errorSearchString = `${error.name} ${error.message}`;
    errorMessage = errorSearchString;
  } else {
    errorSearchString = stringifySafe(error);
    errorMessage = errorSearchString;
  }

  // loop through all possible ChainErrors and compare error string to regex for each ChainError
  // exit on first match - if no match for known errors, will match on the last one - UnkownError
  for (const errorKey of Object.keys(ChainError)) {
    const regexp = new RegExp(ChainError[errorKey], 'i');
    const match = regexp.exec(errorSearchString);
    if (match) {
      newError = new Error(errorMessage);
      newError.name = errorKey; // exmple: Error = 'Account_Exists: ChainError: Chain error message'
      break;
    }
  }

  return newError || error;
}

module.exports = {
  ChainError,
  mapError
};
