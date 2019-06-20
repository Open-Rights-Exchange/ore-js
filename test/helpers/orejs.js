/* global ORE_NETWORK_URI:true */
/* global ORE_OWNER_ACCOUNT_KEY:true */
/* global ORE_PAYER_ACCOUNT_NAME:true */

import { Orejs } from '../../src';
import { mockAccount, mockAbi, mockBlock, mockCode, mockError, mockInfo, mockTransaction } from './fetch';

function constructOrejs(config) {
  const orejs = new Orejs({
    httpEndpoint: ORE_NETWORK_URI,
    keyProvider: [ORE_OWNER_ACCOUNT_KEY],
    ...config
  });

  return orejs;
}

function mockGetAbi(_orejs = undefined) {
  const mockupAbi = jest.fn();

  const getAbi = { code: mockCode(), abi: JSON.parse(mockAbi()) };

  mockupAbi.mockImplementationOnce(() => Promise.resolve(getAbi));
  const orejs = _orejs || constructOrejs();
  orejs.eos.rpc.get_raw_code_and_abi = mockupAbi;

  return getAbi;
}

function mockGetAccount(_orejs = undefined, withInitialCheck = true, _account = {}) {
  const mockupAccount = jest.fn();

  const getAccount = JSON.parse(mockAccount(_account)[0])[0];

  if (withInitialCheck) {
    mockupAccount.mockImplementationOnce(() => Promise.reject(false));
  }
  mockupAccount.mockImplementationOnce(() => Promise.resolve(getAccount));
  const orejs = _orejs || constructOrejs();
  orejs.eos.rpc.get_account = mockupAccount;

  return mockupAccount;
}

function mockGetAccountWithAlreadyExistingAccount(_orejs = undefined, _account = {}) {
  const mockupAccount = jest.fn();

  const getAccount = JSON.parse(mockAccount(_account)[0])[0];

  mockupAccount.mockImplementationOnce(() => Promise.resolve(getAccount));
  mockupAccount.mockImplementationOnce(() => Promise.reject(false));
  mockupAccount.mockImplementationOnce(() => Promise.resolve(getAccount));
  const orejs = _orejs || constructOrejs();
  orejs.eos.rpc.get_account = mockupAccount;

  return getAccount;
}

function mockGetBlock(_orejs = undefined, _block = {}) {
  const mockupBlock = jest.fn();

  const getBlock = JSON.parse(mockBlock(_block)[0])[0];

  mockupBlock.mockImplementation(() => Promise.resolve(getBlock));
  const orejs = _orejs || constructOrejs();
  orejs.eos.rpc.get_block = mockupBlock;

  return getBlock;
}

function mockGetBlockError(_orejs = undefined) {
  const mockupBlock = jest.fn();

  const getBlock = mockError();

  mockupBlock.mockImplementationOnce(() => {
    throw getBlock;
  });
  const orejs = _orejs || constructOrejs();
  orejs.eos.rpc.get_block = mockupBlock;

  return getBlock;
}

function mockGetCurrency(_orejs = undefined, _currency = '1.0000 CPU') {
  const mockupCurrency = jest.fn();

  const getCurrency = _currency;

  mockupCurrency.mockImplementationOnce(() => Promise.resolve(getCurrency));
  const orejs = _orejs || constructOrejs();
  orejs.eos.rpc.get_currency_balance = mockupCurrency;

  return getCurrency;
}

function mockGetInfo(_orejs = undefined, _info = {}) {
  const mockupInfo = jest.fn();

  const getInfo = JSON.parse(mockInfo(_info)[0])[0];

  mockupInfo.mockImplementationOnce(() => Promise.resolve(getInfo));
  const orejs = _orejs || constructOrejs();
  orejs.eos.rpc.get_info = mockupInfo;

  return getInfo;
}

function mockGetTransaction(_orejs = undefined, success = true, _transaction = {}) {
  const mockupTransaction = jest.fn();

  const getTransaction = mockTransaction(_transaction);

  if (success) {
    mockupTransaction.mockImplementationOnce(() => Promise.resolve(getTransaction));
  } else {
    mockupTransaction.mockImplementationOnce(() => Promise.reject(getTransaction));
  }
  const orejs = _orejs || constructOrejs();
  orejs.eos.transact = mockupTransaction;

  return getTransaction;
}

export default {
  constructOrejs,
  mockGetAbi,
  mockGetAccount,
  mockGetAccountWithAlreadyExistingAccount,
  mockGetBlock,
  mockGetBlockError,
  mockGetCurrency,
  mockGetInfo,
  mockGetTransaction
};
