/* global USER_ACCOUNT_ENCRYPTION_SALT:true */
/* global WALLET_PASSWORD:true */
/* global ORE_OWNER_ACCOUNT_KEY:true */
/* global ORE_NETWORK_URI:true */
/* global ORE_PAYER_ACCOUNT_NAME:true */
const ecc = require('eosjs-ecc');
const { mockAction, mockOptions } = require('./helpers/eos');
const { constructOrejs, mockGetAccount, mockGetAccountWithAlreadyExistingAccount, mockGetInfo, mockGetBlock,
  mockGetTransaction } = require('./helpers/orejs');

describe('account', () => {
  let orejs;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('createAccount', () => {
    let spyTransaction;
    let spyAccount;
    let spyInfo;
    let spyBlock;
    let transaction;
    let info;
    let block;

    beforeEach(() => {
      mockGetAccount(orejs);
      transaction = mockGetTransaction(orejs);
      info = mockGetInfo(orejs);
      block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
      spyAccount = jest.spyOn(orejs.eos.rpc, 'get_account');
      spyInfo = jest.spyOn(orejs.eos.rpc, 'get_info');
      spyBlock = jest.spyOn(orejs.eos.rpc, 'get_block');
    });

    it('returns a new account', async () => {
      const permission = 'custom';
      const options = { permission };
      const account = await orejs.createAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME, options);
      expect(spyTransaction).toHaveBeenNthCalledWith(1, {
        actions: [
          mockAction({ account: 'eosio', name: 'newaccount', authorization: { permission } }),
          mockAction({ account: 'eosio', name: 'buyrambytes', authorization: { permission } }),
          mockAction({ account: 'eosio', name: 'delegatebw', authorization: { permission } }),
        ],
      }, mockOptions());
      expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
      expect(spyInfo).toHaveBeenCalledWith({});
      expect(spyBlock).toHaveBeenCalledWith(block.block_num + 1);
      expect(account).toEqual({
        oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
        privateKey: expect.any(String),
        publicKey: expect.any(String),
        transaction,
      });
      expect(ecc.privateToPublic(orejs.decrypt(account.privateKey, WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT))).toEqual(account.publicKey);
    });
  });

  describe('createOreAccount', () => {
    let spyTransaction;
    let spyAccount;
    let spyInfo;
    let spyBlock;
    let transaction;
    let info;
    let block;

    beforeEach(() => {
      mockGetAccount(orejs);
      transaction = mockGetTransaction(orejs);
      info = mockGetInfo(orejs);
      block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
      spyAccount = jest.spyOn(orejs.eos.rpc, 'get_account');
      spyInfo = jest.spyOn(orejs.eos.rpc, 'get_info');
      spyBlock = jest.spyOn(orejs.eos.rpc, 'get_block');
    });

    it('returns a new account', async () => {
      const permission = 'custom';
      const options = { permission };
      const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME, options);
      expect(spyTransaction).toHaveBeenNthCalledWith(1, {
        actions: [
          mockAction({ account: 'eosio', name: 'newaccount', authorization: { permission } }),
          mockAction({ account: 'eosio', name: 'buyrambytes', authorization: { permission } }),
          mockAction({ account: 'eosio', name: 'delegatebw', authorization: { permission } }),
        ],
      }, mockOptions());
      expect(spyTransaction).toHaveBeenNthCalledWith(2, {
        actions: [
          mockAction({ account: 'eosio', name: 'updateauth' }),
          mockAction({ account: 'eosio', name: 'updateauth' }),
          mockAction({ account: 'eosio', name: 'updateauth' }),
          mockAction({ account: 'eosio', name: 'linkauth' }),
        ],
      }, mockOptions());
      expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
      expect(spyInfo).toHaveBeenCalledWith({});
      expect(spyBlock).toHaveBeenCalledWith(block.block_num + 1);
      expect(account).toEqual({
        verifierAuthKey: expect.any(String),
        verifierAuthPublicKey: expect.any(String),
        oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
        privateKey: expect.any(String),
        publicKey: expect.any(String),
        transaction,
      });
      expect(ecc.privateToPublic(orejs.decrypt(account.privateKey, WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT))).toEqual(account.publicKey);
      expect(ecc.privateToPublic(account.verifierAuthKey)).toEqual(account.verifierAuthPublicKey);
    });

    describe('when defining the accountName', () => {
      let spyAccount;
      let spyTransaction;
      let transaction;
      let info;
      let block;

      beforeEach(() => {
        mockGetAccount(orejs);
        transaction = mockGetTransaction(orejs);
        info = mockGetInfo(orejs);
        block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });
        spyAccount = jest.spyOn(orejs.eos.rpc, 'get_account');
        spyTransaction = jest.spyOn(orejs.eos, 'transact');
      });

      xit('returns a new account with the expected accountName', async () => {
        const oreAccountName = 'thenameiwant';
        const options = { oreAccountName };
        const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME, options);
        expect(spyTransaction).toHaveBeenNthCalledWith(1, {
          actions: [
            mockAction({ account: 'eosio', name: 'newaccount', data: { newact: oreAccountName } }),
            mockAction({ account: 'eosio', name: 'buyrambytes' }),
            mockAction({ account: 'eosio', name: 'delegatebw' }),
          ],
        }, mockOptions());
        expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
        expect(account).toEqual({
          verifierAuthKey: expect.any(String),
          verifierAuthPublicKey: expect.any(String),
          oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
          privateKey: expect.any(String),
          publicKey: expect.any(String),
          transaction,
        });
      });
    });

    describe('when the name already exists', () => {
      let spyAccount;
      let transaction;
      let info;
      let block;

      beforeEach(() => {
        mockGetAccountWithAlreadyExistingAccount(orejs);
        transaction = mockGetTransaction(orejs);
        info = mockGetInfo(orejs);
        block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });
        spyAccount = jest.spyOn(orejs.eos.rpc, 'get_account');
      });

      it('still returns a new account', async () => {
        const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME);
        expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
        expect(account).toEqual({
          verifierAuthKey: expect.any(String),
          verifierAuthPublicKey: expect.any(String),
          oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
          privateKey: expect.any(String),
          publicKey: expect.any(String),
          transaction,
        });
      });
    });
  });

  describe('eosBase32', () => {
    it('encodes correctly', async () => {
      const accountName = await orejs.eosBase32('abcde.067899');
      expect(accountName).toEqual('abcde.vwxyzz');
    });
  });
});
