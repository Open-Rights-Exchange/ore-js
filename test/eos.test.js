/* global ORE_TESTA_ACCOUNT_NAME:true */
/* global ORE_NETWORK_URI:true */
import { mockBlock, mockInfo } from './helpers/fetch';
import { constructOrejs, mockGetAccount, mockGetInfo, mockGetBlock, mockGetBlockError, mockGetTransaction } from './helpers/orejs';

describe('eos', () => {
  let orejs;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('awaitTransaction', () => {
    let transaction;
    let info;
    let block;
    let spyInfo;
    let spyBlock;

    beforeAll(() => {
      transaction = mockGetTransaction(orejs);
      info = mockGetInfo(orejs);
      block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id } }] });
      spyInfo = jest.spyOn(orejs.eos.rpc, 'get_info');
      spyBlock = jest.spyOn(orejs.eos.rpc, 'get_block');
    });

    it('returns the transaction', async () => {
      await orejs.awaitTransaction(async () => {
        await setTimeout(() => true, 10);
        return transaction;
      }, { blocksToCheck: 10, checkInterval: 10 });
      expect(spyInfo).toHaveBeenCalledWith({});
      expect(spyBlock).toHaveBeenCalledWith(block.block_num + 1);
    });

    describe('when the transaction is not found', () => {
      beforeAll(() => {
        jest.clearAllMocks();
        transaction = mockGetTransaction(orejs);
        info = mockGetInfo(orejs);
        block = mockGetBlock(orejs, { block_num: info.head_block_num, transactions: [{ trx: { id: transaction.transaction_id + 1 } }] });
      });

      it('throws an error with the block number', async () => {
        const result = orejs.awaitTransaction(async () => {
          await setTimeout(() => true, 10);
          return transaction;
        }, { blocksToCheck: 2, checkInterval: 10 });
        await expect(result).rejects.toThrow(/Await Transaction Timeout/);
      });
    });

    describe('when the block is not found', () => {
      beforeAll(() => {
        jest.clearAllMocks();
        transaction = mockGetTransaction(orejs);
        info = mockGetInfo(orejs);
        block = mockGetBlockError(orejs);
      });

      it('throws an error with the block number', async () => {
        const result = orejs.awaitTransaction(async () => {
          await setTimeout(() => true, 10);
          return transaction;
        }, 10, 10);
        await expect(result).rejects.toThrow(/Await Transaction Failure/);
      });
    });
  });

  describe('hasTransaction', () => {
    let block;
    let transactionId;
    let transaction;

    beforeAll(() => {
      transactionId = 'asdf';
      transaction = {
        trx: {
          id: transactionId
        }
      };
    });

    describe('when the block includes the transaction', () => {
      beforeAll(() => {
        block = {
          transactions: [transaction]
        };
      });

      it('returns true', () => {
        const hasTransaction = orejs.hasTransaction(block, transactionId);
        expect(hasTransaction).toEqual(true);
      });
    });

    describe('when the block does not include the transaction', () => {
      beforeAll(() => {
        block = {
          transactions: []
        };
      });

      it('returns false', () => {
        const hasTransaction = orejs.hasTransaction(block, transactionId);
        expect(hasTransaction).toEqual(false);
      });
    });
  });
});
