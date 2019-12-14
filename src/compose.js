/* eslint-disable quote-props */
const Account_DeleteAuth = require('./templates/chainActions/account_deleteAuth');
const Account_LinkAuth = require('./templates/chainActions/account_linkAuth');
const Account_UnlinkAuth = require('./templates/chainActions/account_unlinkAuth');
const Account_UpdateAuth = require('./templates/chainActions/account_updateAuth');
const CreateBridge_Create = require('./templates/chainActions/createBridge_create');
const CreateBridge_Define = require('./templates/chainActions/createBridge_define');
const CreateBridge_Init = require('./templates/chainActions/createBridge_init');
const CreateBridge_Reclaim = require('./templates/chainActions/createBridge_reclaim');
const CreateBridge_Transfer = require('./templates/chainActions/createBridge_transfer');
const CreateBridge_Whitelist = require('./templates/chainActions/createBridge_whitelist');
const Ore_UpsertRight = require('./templates/chainActions/ore_upsertRight');
const Token_Approve = require('./templates/chainActions/token_approve');
const Token_Create = require('./templates/chainActions/token_create');
const Token_Issue = require('./templates/chainActions/token_issue');
const Token_Retire = require('./templates/chainActions/token_retire');
const Token_Transfer = require('./templates/chainActions/token_transfer');
const Token_TransferFrom = require('./templates/chainActions/token_transferFrom');

const ChainAction = {
  Account_DeleteAuth,
  Account_LinkAuth,
  Account_UnlinkAuth,
  Account_UpdateAuth,
  CreateBridge_Create,
  CreateBridge_Define,
  CreateBridge_Init,
  CreateBridge_Reclaim,
  CreateBridge_Transfer,
  CreateBridge_Whitelist,
  Ore_UpsertRight,
  Token_Approve,
  Token_Create,
  Token_Issue,
  Token_Retire,
  Token_Transfer,
  Token_TransferFrom
};

function composeAction(actionType, args) {
  if (typeof actionType !== 'function') {
    return null;
    // throw new Error('composeAction called with invalid or missing actionType:', actionType);
  }
  return actionType(args);
}

module.exports = {
  ChainAction,
  composeAction
};
