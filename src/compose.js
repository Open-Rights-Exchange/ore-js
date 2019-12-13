/* eslint-disable quote-props */
import account_deleteAuth from './templates/actions/account_deleteAuth';
import account_linkAuth from './templates/actions/account_linkAuth';
import account_unlinkAuth from './templates/actions/account_unlinkAuth';
import account_updateAuth from './templates/actions/account_updateAuth';
import createBridge_create from './templates/actions/createBridge_create';
import createBridge_define from './templates/actions/createBridge_define';
import createBridge_init from './templates/actions/createBridge_init';
import createBridge_reclaim from './templates/actions/createBridge_reclaim';
import createBridge_transfer from './templates/actions/createBridge_transfer';
import createBridge_whitelist from './templates/actions/createBridge_whitelist';
import ore_upsertRight from './templates/actions/ore_upsertRight';
import token_approve from './templates/actions/token_approve';
import token_create from './templates/actions/token_create';
import token_issue from './templates/actions/token_issue';
import token_retire from './templates/actions/token_retire';
import token_transfer from './templates/actions/token_transfer';
import token_transferFrom from './templates/actions/token_transferFrom';

export const action = {
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
