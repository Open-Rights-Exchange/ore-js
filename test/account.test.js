/* global USER_ACCOUNT_ENCRYPTION_SALT:true */
/* global WALLET_PASSWORD:true */
/* global ORE_OWNER_ACCOUNT_KEY:true */
/* global ORE_NETWORK_URI:true */
/* global ORE_PAYER_ACCOUNT_NAME:true */
import { Keygen } from 'eosjs-keygen';
import ecc from 'eosjs-ecc';
import { mockAction, mockOptions } from './helpers/eos';
import { constructOrejs, mockGetAccount, mockGetAccountWithAlreadyExistingAccount, mockGetInfo, mockGetBlock,
  mockGetTransaction } from './helpers/orejs';

describe('account', () => {
  let orejs;
  let transaction;
  let info;
  let block;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  // NOTE: The functionality of addPermission is only partially tested directly.
  // NOTE: Additional functionality is tested via createKeyPair
  describe('addPermission', () => {
    const accountName = 'accountname';
    let keys;
    const parentPermission = 'active';
    const options = { authPermission: parentPermission };

    beforeEach(async () => {
      keys = await Keygen.generateMasterKeys();
      mockGetAccount(orejs, false);
      mockGetTransaction(orejs);
    });

    describe('when removing an existing permission', () => {
      const permissionName = 'newpermission';
      let spyTransaction;
      let spyAccount;

      beforeEach(() => {
        spyTransaction = jest.spyOn(orejs.eos, 'transact');
        spyAccount = jest.spyOn(orejs.eos.rpc, 'get_account');
      });

      it('returns the transaction', async () => {
        const permissionTransaction = await orejs.addPermission(accountName, [keys.publicKeys.active], permissionName, parentPermission, options);
        expect(spyTransaction).toHaveBeenNthCalledWith(1, {
          actions: [
            mockAction({
              account: 'eosio',
              name: 'updateauth',
              authorization: { actor: accountName, permission: parentPermission },
              data: {
                account: accountName,
                auth: {
                  accounts: [],
                  keys: [{
                    key: expect.any(String),
                    weight: 1
                  }],
                  threshold: 1,
                  waits: []
                },
                parent: parentPermission,
                permission: permissionName
              }
            })
          ]
        }, mockOptions());
        expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
      });
    });
  });

  describe('createKeyPair', () => {
    const accountName = 'accountname';
    const parentPermission = 'active';
    const options = { parentPermission };
    let spyAccount;
    let spyTransaction;
    let spyInfo;
    let spyBlock;

    beforeEach(() => {
      mockGetAccount(orejs, false);
      mockGetTransaction(orejs);

      transaction = mockGetTransaction(orejs);
      info = mockGetInfo(orejs);
      block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });

      spyTransaction = jest.spyOn(orejs.eos, 'transact');
      spyAccount = jest.spyOn(orejs.eos.rpc, 'get_account');
      spyInfo = jest.spyOn(orejs.eos.rpc, 'get_info');
      spyBlock = jest.spyOn(orejs.eos.rpc, 'get_block');
    });

    describe('when generating a new permission', () => {
      const permissionName = 'newpermission';

      it('returns a new key pair', async () => {
        const keypair = await orejs.createKeyPair(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, accountName, permissionName, options);
        expect(spyTransaction).toHaveBeenNthCalledWith(1, {
          actions: [
            mockAction({
              account: 'eosio',
              name: 'updateauth',
              authorization: { actor: accountName, permission: parentPermission },
              data: {
                account: accountName,
                auth: {
                  accounts: [],
                  keys: [{
                    key: expect.any(String),
                    weight: 1
                  }],
                  threshold: 1,
                  waits: []
                },
                parent: parentPermission,
                permission: permissionName
              }
            })
          ]
        }, mockOptions());
        // expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
        expect(spyInfo).toHaveBeenCalledWith({});
        expect(spyBlock).toHaveBeenCalledWith(block.block_num + 1);
        expect(ecc.privateToPublic(orejs.decrypt(keypair.privateKeys.owner, WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT))).toEqual(keypair.publicKeys.owner);
      });

      describe('when passing in links', () => {
        const code = 'contract';
        const type = 'action';

        beforeEach(() => {
          options.links = [{ code, type }];
        });

        it('returns a new key pair, with links', async () => {
          const keypair = await orejs.createKeyPair(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, accountName, permissionName, options);
          expect(spyTransaction).toHaveBeenNthCalledWith(1, {
            actions: [
              mockAction({
                account: 'eosio',
                name: 'updateauth',
                authorization: { actor: accountName, permission: parentPermission },
                data: {
                  account: accountName,
                  auth: {
                    accounts: [],
                    keys: [{
                      key: expect.any(String),
                      weight: 1
                    }],
                    threshold: 1,
                    waits: []
                  },
                  parent: parentPermission,
                  permission: permissionName
                }
              }),
              mockAction({
                account: 'eosio',
                name: 'linkauth',
                authorization: { actor: accountName, permission: parentPermission },
                data: {
                  account: accountName,
                  code,
                  type,
                  requirement: permissionName
                }
              })
            ]
          }, mockOptions());
        });
      });
    });

    describe('when appending keys to an pre-existing permission', () => {
      const permissionName = 'custom';

      beforeEach(() => {
        options.links = [];
        mockGetAccount(orejs, false);
      });

      it('returns the existing and new key pair', async () => {
        const keypair = await orejs.createKeyPair(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, accountName, permissionName, options);
        expect(spyTransaction).toHaveBeenNthCalledWith(1, {
          actions: [
            mockAction({
              account: 'eosio',
              name: 'updateauth',
              authorization: { actor: accountName, permission: parentPermission },
              data: {
                account: accountName,
                auth: {
                  accounts: [],
                  keys: [{
                    key: expect.any(String),
                    weight: 1
                  }, {
                    key: expect.any(String),
                    weight: 1
                  }],
                  threshold: 1,
                  waits: []
                },
                parent: parentPermission,
                permission: permissionName
              }
            })
          ]
        }, mockOptions());
        // expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
        expect(ecc.privateToPublic(orejs.decrypt(keypair.privateKeys.owner, WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT))).toEqual(keypair.publicKeys.owner);
      });
    });

    describe('when adding an pre-defined key pair', () => {
      const permissionName = 'custom';
      const keys = {
        privateKeys: {
          owner: '{"iv":"xr5XTgow76QCpEe8Tij7xw==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"gcm","adata":"","cipher":"aes","ct":"2YAap55e6O8gwZ6m33UjEjxqw1GU+cZbVrYP7TDRFiF0axe1XJ2W+uvhgG5ArEga8GO8cnNf+6KaFaQ="}',
          active: '{"iv":"whCS0NVLJv+5xFxm/udHaw==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"gcm","adata":"","cipher":"aes","ct":"G7So6hZeuqp3eZT4aj3w/C5lhXIJ8Z+9dTUCQNAhSWMVB9S+k+IHoUGQKgAi1cz3vnQ3VH4DdJobec4="}'
        },
        publicKeys: {
          owner: 'EOS8ekDXRqcWGYXHDZp246B8VF9DTwkuz13u5tpPnMdptE2SE9sVf',
          active: 'EOS6iGJBT4PPuhm5zKiKUiFNi7eYqLFofZqMYDyZyKHfNt5fuRLF2'
        }
      };

      beforeEach(() => {
        options.keys = keys;
      });

      it('returns the existing key pair', async () => {
        const keypair = await orejs.createKeyPair(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, accountName, permissionName, options);
        expect(ecc.privateToPublic(orejs.decrypt(keypair.privateKeys.owner, WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT))).toEqual(keypair.publicKeys.owner);
        expect(keypair.publicKeys.owner).toEqual(keys.publicKeys.owner);
      });
    });
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
        const options = { permission, blocksToCheck: 20, checkInterval: 500 };
        const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME, options);
        expect(spyTransaction).toHaveBeenNthCalledWith(1, {
          actions: [
            mockAction({ account: 'eosio',
              name: 'newaccount',
              authorization: { permission },
              data: {
                creator: ORE_PAYER_ACCOUNT_NAME,
                name: expect.any(String),
                newact: expect.any(String),
                owner: expect.any(Object),
                active: expect.any(Object)
              } }),
            mockAction({ account: 'eosio', name: 'buyrambytes', authorization: { permission } }),
            mockAction({ account: 'eosio',
              name: 'delegatebw',
              authorization: { permission },
              data: {
                from: ORE_PAYER_ACCOUNT_NAME,
                receiver: expect.any(String),
                stake_net_quantity: '0.1000 SYS',
                stake_cpu_quantity: '0.1000 SYS',
                transfer: false
              } })
          ]
        }, mockOptions());
        expect(spyTransaction).toHaveBeenNthCalledWith(2, {
          actions: [
            mockAction({ account: 'eosio', name: 'updateauth' }),
            mockAction({ account: 'eosio', name: 'linkauth' })
          ]
        }, mockOptions());
        expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
        expect(spyInfo).toHaveBeenCalledWith({});
        expect(spyBlock).toHaveBeenCalledWith(block.block_num + 1);
        expect(account).toEqual({
          verifierAuthKey: expect.stringMatching(/^\w*$/),
          verifierAuthPublicKey: expect.stringMatching(/^EOS\w*$/),
          oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
          privateKey: expect.stringMatching(/^\{.*\}$/),
          publicKey: expect.stringMatching(/^EOS\w*$/),
          keys: expect.objectContaining({
            privateKeys: expect.objectContaining({
              active: expect.stringMatching(/^\{.*\}$/),
              owner: expect.stringMatching(/^\{.*\}$/)
            }),
            publicKeys: expect.objectContaining({
              active: expect.stringMatching(/^EOS\w*$/),
              owner: expect.stringMatching(/^EOS\w*$/)
            })
          }),
          transaction
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
          expect(spyAccount).toHaveBeenCalledWith(expect.stringMatching(/[a-z1-5]{12}/));
          expect(account).toEqual({
            verifierAuthKey: expect.stringMatching(/^\w*$/),
            verifierAuthPublicKey: expect.stringMatching(/^EOS\w*$/),
            oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
            privateKey: expect.stringMatching(/^\{.*\}$/),
            publicKey: expect.stringMatching(/^EOS\w*$/),
            keys: expect.objectContaining({
              privateKeys: expect.objectContaining({
                active: expect.stringMatching(/^\{.*\}$/),
                owner: expect.stringMatching(/^\{.*\}$/)
              }),
              publicKeys: expect.objectContaining({
                active: expect.stringMatching(/^EOS\w*$/),
                owner: expect.stringMatching(/^EOS\w*$/)
              })
            }),
            transaction
          });
        });
      });

      describe('when defining an account name prefix', () => {
        const options = { accountNamePrefix: 'ore' };

        it('returns an account with the proper name', async () => {
          const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME, options);
          expect(account).toEqual(expect.objectContaining({
            oreAccountName: expect.stringMatching(/ore[a-z1-5]{9}/)
          }));
        });
      });

      describe('when pre-defining keys', () => {
        const key = 'EOS5vTStKDUDbLHu4hSi8iFrmaJET88HHcL5oVBYQ1wd2aeMHgHs2';
        const options = { keys: { publicKeys: { owner: key } } };

        it('returns an account with the specified key', async () => {
          const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME, options);
          expect(account).toEqual(expect.objectContaining({
            keys: expect.objectContaining({
              publicKeys: expect.objectContaining({ owner: key })
            })
          }));
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
              mockAction({ account: 'eosio',
                name: 'delegatebw',
                data: {
                  from: ORE_PAYER_ACCOUNT_NAME,
                  receiver: expect.any(String),
                  stake_net_quantity: '0.1000 EOS',
                  stake_cpu_quantity: '0.1000 EOS',
                  transfer: false
                } })
            ]
          }, mockOptions());
        });

        it('returns a new account without the verifier keys', async () => {
          const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME);
          expect(account).toEqual({
            oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
            privateKey: expect.stringMatching(/^\{.*\}$/),
            publicKey: expect.stringMatching(/^EOS\w*$/),
            keys: expect.objectContaining({
              privateKeys: expect.objectContaining({
                active: expect.stringMatching(/^\{.*\}$/),
                owner: expect.stringMatching(/^\{.*\}$/)
              }),
              publicKeys: expect.objectContaining({
                active: expect.stringMatching(/^EOS\w*$/),
                owner: expect.stringMatching(/^EOS\w*$/)
              })
            }),
            transaction
          });
        });
      });

      describe('when the chain fails to create a new account', async () => {
        const options = { confirm: true };

        beforeEach(() => {
          transaction = mockGetTransaction(orejs, false);
        });

        it('returns a failure', async () => {
          try {
            const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME, options);
          } catch (error) {
            expect(error.message).toMatch(/^Await Transaction Failure: .*/);
          }
        });
      });
    });

    describe('when defining the accountName', () => {
      beforeEach(() => {
        const transaction = mockGetTransaction(orejs);
        const info = mockGetInfo(orejs);
        const block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });
      });

      it('returns a new account with the expected accountName', async () => {
        const oreAccountName = 'thenameiwant';
        const options = { oreAccountName };
        const account = await orejs.createOreAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, ORE_OWNER_ACCOUNT_KEY, ORE_PAYER_ACCOUNT_NAME, options);
        expect(account).toEqual({
          oreAccountName,
          privateKey: expect.stringMatching(/^\{.*\}$/),
          publicKey: expect.stringMatching(/^EOS\w*$/),
          keys: expect.objectContaining({
            privateKeys: expect.objectContaining({
              active: expect.stringMatching(/^\{.*\}$/),
              owner: expect.stringMatching(/^\{.*\}$/)
            }),
            publicKeys: expect.objectContaining({
              active: expect.stringMatching(/^EOS\w*$/),
              owner: expect.stringMatching(/^EOS\w*$/)
            })
          }),
          transaction
        });
      });
    });
  });

  describe('createBridgeAccount', () => {
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
      const accountName = 'eptestoretyl';
      const dappName = 'ep.test.ore.tyl';
      const options = { permission, origin: dappName, blocksToCheck: 50 };
      const authorizingAccount = { accountName, permission };
      const account = await orejs.createBridgeAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, authorizingAccount, options);
      expect(spyTransaction).toHaveBeenNthCalledWith(1, {
        actions: [
          mockAction({ account: 'createbridge',
            name: 'create',
            authorization: { permission },
            data: {
              memo: accountName,
              account: expect.stringMatching(/[a-z1-5]{12}/),
              ownerkey: expect.stringMatching(/^EOS\w*$/),
              activekey: expect.stringMatching(/^EOS\w*$/),
              origin: dappName
            } })
        ]
      }, mockOptions());
      expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
      expect(spyInfo).toHaveBeenCalledWith({});
      expect(spyBlock).toHaveBeenCalledWith(block.block_num + 1);
      expect(account).toEqual({
        oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
        privateKey: expect.stringMatching(/^\{.*\}$/),
        publicKey: expect.stringMatching(/^EOS\w*$/),
        keys: expect.objectContaining({
          privateKeys: expect.objectContaining({
            active: expect.stringMatching(/^\{.*\}$/),
            owner: expect.stringMatching(/^\{.*\}$/)
          }),
          publicKeys: expect.objectContaining({
            active: expect.stringMatching(/^EOS\w*$/),
            owner: expect.stringMatching(/^EOS\w*$/)
          })
        }),
        transaction
      });
      expect(ecc.privateToPublic(orejs.decrypt(account.privateKey, WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT))).toEqual(account.publicKey);
    });

    it('returns a new account under a new contractName', async () => {
      const permission = 'custom';
      const accountName = 'eptestoretyl';
      const dappName = 'ep.test.ore.tyl';
      const contractName = 'orebridge';
      const options = { permission, origin: dappName, contractName };
      const authorizingAccount = { accountName, permission };
      const account = await orejs.createBridgeAccount(WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT, authorizingAccount, options);
      expect(spyTransaction).toHaveBeenNthCalledWith(1, {
        actions: [
          mockAction({ account: contractName,
            name: 'create',
            authorization: { permission },
            data: {
              memo: accountName,
              account: expect.stringMatching(/[a-z1-5]{12}/),
              ownerkey: expect.stringMatching(/^EOS\w*$/),
              activekey: expect.stringMatching(/^EOS\w*$/),
              origin: dappName
            } })
        ]
      }, mockOptions());
      expect(spyAccount).toHaveBeenCalledWith(expect.any(String));
      expect(spyInfo).toHaveBeenCalledWith({});
      expect(spyBlock).toHaveBeenCalledWith(block.block_num + 1);
      expect(account).toEqual({
        oreAccountName: expect.stringMatching(/[a-z1-5]{12}/),
        privateKey: expect.stringMatching(/^\{.*\}$/),
        publicKey: expect.stringMatching(/^EOS\w*$/),
        keys: expect.objectContaining({
          privateKeys: expect.objectContaining({
            active: expect.stringMatching(/^\{.*\}$/),
            owner: expect.stringMatching(/^\{.*\}$/)
          }),
          publicKeys: expect.objectContaining({
            active: expect.stringMatching(/^EOS\w*$/),
            owner: expect.stringMatching(/^EOS\w*$/)
          })
        }),
        transaction
      });
      expect(ecc.privateToPublic(orejs.decrypt(account.privateKey, WALLET_PASSWORD, USER_ACCOUNT_ENCRYPTION_SALT))).toEqual(account.publicKey);
    });
  });

  describe('eosBase32', () => {
    it('encodes correctly', async () => {
      const accountName = await orejs.eosBase32('abcde.067899');
      expect(accountName).toEqual('abcde.vwxyzz');
    });
  });

  describe('generateAccountName', () => {
    let spyAccount;
    let accountMock;

    beforeEach(() => {
      accountMock = mockGetAccount(orejs);
    });

    it('returns a random string', async () => {
      const accountName = await orejs.generateAccountName();
      expect(accountMock).toHaveBeenCalled();
      expect(accountName).toEqual(expect.stringMatching(/[a-z1-5]{12}/));
    });

    it('lets us prefix account names', async () => {
      const accountName = await orejs.generateAccountName('ore');
      expect(accountName).toEqual(expect.stringMatching(/ore[a-z1-5]{9}/));
    });

    it('does not always have to check for pre-existing names', async () => {
      const accountName = await orejs.generateAccountName('ore', false);
      expect(accountMock).not.toHaveBeenCalled();
      expect(accountName).toEqual(expect.stringMatching(/ore[a-z1-5]{9}/));
    });
  });

  describe('generateEncryptedKeys', async () => {
    const password = 'password';
    const salt = 'salt';

    it('returns a full set of keys', async () => {
      const keys = await orejs.generateEncryptedKeys(password, salt);
      expect(keys).toEqual(expect.objectContaining({
        privateKeys: expect.objectContaining({
          active: expect.stringMatching(/^\{.*\}$/),
          owner: expect.stringMatching(/^\{.*\}$/)
        }),
        publicKeys: expect.objectContaining({
          active: expect.stringMatching(/^EOS\w*$/),
          owner: expect.stringMatching(/^EOS\w*$/)
        })
      }));
    });

    describe('when partially defining keys', () => {
      const publicKey = 'EOS8MoQ6DPdM9SWsaKbYTu1P54tLvdxrZY8DQ5uUrwQ9LMtoByCwm';
      const predefinedKeys = { publicKeys: { owner: publicKey } };

      it('returns the both the specified and non-specified keys', async () => {
        const keys = await orejs.generateEncryptedKeys(password, salt, predefinedKeys);
        expect(keys).toEqual(expect.objectContaining({
          publicKeys: expect.objectContaining({
            active: expect.stringMatching(/^EOS\w*$/),
            owner: expect.stringMatching(publicKey)
          })
        }));
      });
    });

    describe('when defining unencrypted keys', () => {
      const privateKey = '5KC9gtjqTQHLchEZAu4QUif8MNKoZPZENEJmsiapvxDAJCZpzGK';
      const predefinedKeys = { privateKeys: { owner: privateKey } };

      it('returns the key encrypted', async () => {
        const keys = await orejs.generateEncryptedKeys(password, salt, predefinedKeys);
        expect(keys).toEqual(expect.objectContaining({
          privateKeys: expect.objectContaining({
            active: expect.stringMatching(/^\{.*\}$/),
            owner: expect.stringMatching(/^\{.*\}$/)
          })
        }));
      });
    });

    describe('when defining encrypted keys', () => {
      const privateKey = '{"iv":"xr5XTgow76QCpEe8Tij7xw==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"gcm","adata":"","cipher":"aes","ct":"2YAap55e6O8gwZ6m33UjEjxqw1GU+cZbVrYP7TDRFiF0axe1XJ2W+uvhgG5ArEga8GO8cnNf+6KaFaQ="}';
      const predefinedKeys = { privateKeys: { owner: privateKey } };

      it('returns the key', async () => {
        const keys = await orejs.generateEncryptedKeys(password, salt, predefinedKeys);
        expect(keys).toEqual(expect.objectContaining({
          privateKeys: expect.objectContaining({
            active: expect.stringMatching(/^\{.*\}$/),
            owner: expect.stringContaining(privateKey)
          })
        }));
      });
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
  });
});
