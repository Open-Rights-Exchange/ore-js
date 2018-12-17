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
  let transaction;
  let info;
  let block;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('createOreAccount', () => {
    describe('when generating a new account name', () => {
      let spyTransaction;
      let spyAccount;
      let spyInfo;
      let spyBlock;

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
            mockAction({ account: 'eosio', name: 'newaccount', authorization: { permission }, data: {
              creator: ORE_PAYER_ACCOUNT_NAME,
              name: expect.any(String),
              newact: expect.any(String),
              owner: expect.any(Object),
              active: expect.any(Object),
            } }),
            mockAction({ account: 'eosio', name: 'buyrambytes', authorization: { permission } }),
            mockAction({ account: 'eosio', name: 'delegatebw', authorization: { permission }, data: {
              from: ORE_PAYER_ACCOUNT_NAME,
              receiver: expect.any(String),
              stake_net_quantity: '0.1000 SYS',
              stake_cpu_quantity: '0.1000 SYS',
              transfer: false,
            } }),
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

      describe('when the name already exists', () => {
        let spyAccount;

        beforeEach(() => {
          mockGetAccountWithAlreadyExistingAccount(orejs);
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

      describe('when defining an eos chain', () => {
        let spyTransaction;
        let transaction;
        let info;
        let block;

        beforeEach(() => {
          orejs = constructOrejs({ chainName: 'eos' });
          mockGetAccount(orejs);
          transaction = mockGetTransaction(orejs);
          info = mockGetInfo(orejs);
          block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });
          spyTransaction = jest.spyOn(orejs.eos, 'transact');
        });

        it('returns a new account with the expected tokenSymbol', async () => {
          const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME);
          expect(spyTransaction).toHaveBeenNthCalledWith(1, {
            actions: [
              mockAction({ account: 'eosio', name: 'newaccount' }),
              mockAction({ account: 'eosio', name: 'buyrambytes' }),
              mockAction({ account: 'eosio', name: 'delegatebw', data: {
                from: ORE_PAYER_ACCOUNT_NAME,
                receiver: expect.any(String),
                stake_net_quantity: '0.1000 EOS',
                stake_cpu_quantity: '0.1000 EOS',
                transfer: false,
              } }),
            ],
          }, mockOptions());
        });

        it('returns a new account without the verifier keys', async () => {
          const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME);
          expect(account).toEqual({
            oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
            privateKey: expect.any(String),
            publicKey: expect.any(String),
            transaction,
          });
        });
      });
    });

    describe('when defining the accountName', () => {
      beforeEach(() => {
        let transaction = mockGetTransaction(orejs);
        let info = mockGetInfo(orejs);
        let block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });
      });

      it('returns a new account with the expected accountName', async () => {
        const oreAccountName = 'thenameiwant';
        const options = { oreAccountName };
        const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME, options);
        expect(account).toEqual({
          oreAccountName,
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

  describe('getNameAlreadyExists', async () => {
    let accountName;

    beforeEach(() => {
      accountName = 'thenameiwant';
    });

    describe('when the name already exists', async () => {

      beforeEach(() => {
        mockGetAccountWithAlreadyExistingAccount(orejs);
      });

      it('return true', async () => {
        const nameAlreadyExists = await orejs.getNameAlreadyExists(accountName);
        expect(nameAlreadyExists).toEqual(true);
      });
    });

    describe('when the name does not yet exist', async () => {

      beforeEach(() => {
        mockGetAccount(orejs);
      });

      it('returns false', async () => {
        const nameAlreadyExists = await orejs.getNameAlreadyExists(accountName);
        expect(nameAlreadyExists).toEqual(false);
      });
    });
  });});
