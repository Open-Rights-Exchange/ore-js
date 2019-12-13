/* eslint-disable quote-props */
import Account_DeleteAuth from './templates/chainActions/account_deleteAuth';
import Account_LinkAuth from './templates/chainActions/account_linkAuth';
import Account_UnlinkAuth from './templates/chainActions/account_unlinkAuth';
import Account_UpdateAuth from './templates/chainActions/account_updateAuth';
import CreateBridge_Create from './templates/chainActions/createBridge_create';
import CreateBridge_Define from './templates/chainActions/createBridge_define';
import CreateBridge_Init from './templates/chainActions/createBridge_init';
import CreateBridge_Reclaim from './templates/chainActions/createBridge_reclaim';
import CreateBridge_Transfer from './templates/chainActions/createBridge_transfer';
import CreateBridge_Whitelist from './templates/chainActions/createBridge_whitelist';
import Ore_UpsertRight from './templates/chainActions/ore_upsertRight';
import Token_Approve from './templates/chainActions/token_approve';
import Token_Create from './templates/chainActions/token_create';
import Token_Issue from './templates/chainActions/token_issue';
import Token_Retire from './templates/chainActions/token_retire';
import Token_Transfer from './templates/chainActions/token_transfer';
import Token_TransferFrom from './templates/chainActions/token_transferFrom';

export const ChainAction = {
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

export function composeAction(actionType, args) {
  const actionComposer = actionType;
  return actionComposer(args);
}
