/* eslint-disable quote-props */
import account_deleteAuth from './templates/chainActions/account_deleteAuth';
import account_linkAuth from './templates/chainActions/account_linkAuth';
import account_unlinkAuth from './templates/chainActions/account_unlinkAuth';
import account_updateAuth from './templates/chainActions/account_updateAuth';
import createBridge_create from './templates/chainActions/createBridge_create';
import createBridge_define from './templates/chainActions/createBridge_define';
import createBridge_init from './templates/chainActions/createBridge_init';
import createBridge_reclaim from './templates/chainActions/createBridge_reclaim';
import createBridge_transfer from './templates/chainActions/createBridge_transfer';
import createBridge_whitelist from './templates/chainActions/createBridge_whitelist';
import ore_upsertRight from './templates/chainActions/ore_upsertRight';
import token_approve from './templates/chainActions/token_approve';
import token_create from './templates/chainActions/token_create';
import token_issue from './templates/chainActions/token_issue';
import token_retire from './templates/chainActions/token_retire';
import token_transfer from './templates/chainActions/token_transfer';
import token_transferFrom from './templates/chainActions/token_transferFrom';

export const chainAction = {
  account_deleteAuth,
  account_linkAuth,
  account_unlinkAuth,
  account_updateAuth,
  createBridge_create,
  createBridge_define,
  createBridge_init,
  createBridge_reclaim,
  createBridge_transfer,
  createBridge_whitelist,
  ore_upsertRight,
  token_approve,
  token_create,
  token_issue,
  token_retire,
  token_transfer,
  token_transferFrom
};

export function composeAction(actionType, args) {
  const actionComposer = actionType;
  return actionComposer(args);
}
