/* global ORE_NETWORK_URI:true */
/* global ORE_OWNER_ACCOUNT_NAME:true */
/* global ORE_TESTA_ACCOUNT_NAME:true */
import { expectFetch, mock, mockInfo } from './helpers/fetch';
import { mockAction, mockOptions } from './helpers/eos';
import { constructOrejs, mockGetBlock, mockGetInfo, mockGetTransaction } from './helpers/orejs';

const ORE_TOKEN_CONTRACT = 'token.ore';
const TOKEN_SYMBOL = 'LUME';

describe('ore', () => {
  let orejs;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('getBalance', () => {
    let oreBalance;

    beforeEach(() => {
      oreBalance = 30;

      fetch.resetMocks();
      fetch.mockResponses(mock([`${oreBalance}.0000 ${TOKEN_SYMBOL}`]));
      orejs = constructOrejs({ fetch });
    });

    it('returns the ore balance', async () => {
      oreBalance = await orejs.getBalance(ORE_TESTA_ACCOUNT_NAME, TOKEN_SYMBOL, ORE_TOKEN_CONTRACT);
      expect(oreBalance).toEqual(oreBalance);
    });
  });

  describe('approveTransfer', () => {
    let oreBalance;
    let memo;
    let spyTransaction;
    let transaction;

    beforeEach(() => {
      oreBalance = 10;
      memo = `approve ${TOKEN_SYMBOL} transfer`;
      fetch.resetMocks();
      fetch.mockResponses(mock([`${oreBalance}.0000 ${TOKEN_SYMBOL}`]));
      orejs = constructOrejs({ fetch });
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    describe('when authorized', () => {
      it('returns', async () => {
        mockGetInfo(orejs);
        mockGetBlock(orejs);
        const result = await orejs.approveTransfer(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, oreBalance, ORE_TOKEN_CONTRACT, memo);
        expect(spyTransaction).toHaveBeenCalledWith({ actions: [mockAction({ account: ORE_TOKEN_CONTRACT, name: 'approve' })] }, mockOptions());
      });
    });
  });

  describe('createToken', () => {
    let oreBalance;
    let spyTransaction;
    let transaction;

    beforeEach(() => {
      oreBalance = 10;
      orejs = constructOrejs({ fetch });
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    describe('when authorized', () => {
      it('returns', async () => {
        const result = await orejs.createToken(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, oreBalance, ORE_TOKEN_CONTRACT);
        expect(spyTransaction).toHaveBeenCalledWith({ actions: [mockAction({ account: ORE_TOKEN_CONTRACT, name: 'create' })] }, mockOptions());
      });
    });
  });

  describe('transferToken', () => {
    let oreBalance;
    let spyTransaction;
    let transaction;
    let memo;
    let permission;

    beforeEach(() => {
      oreBalance = 10;
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
      memo = 'some note';
      permission = 'custom';
    });

    describe('when authorized', () => {
      it('returns', async () => {
        const result = await orejs.transferToken(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, oreBalance, ORE_TOKEN_CONTRACT, memo, permission);
        expect(spyTransaction).toHaveBeenCalledWith({ actions: [mockAction({ account: ORE_TOKEN_CONTRACT, name: 'transfer' })] }, mockOptions());
      });
    });

    describe('when not broadcast', () => {
      it('returns', async () => {
        const result = await orejs.transferToken(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, oreBalance, ORE_TOKEN_CONTRACT, memo, permission, false);
        expect(spyTransaction).toHaveBeenCalledWith({ actions: [mockAction({ account: ORE_TOKEN_CONTRACT, name: 'transfer' })] }, mockOptions({ broadcast: false }));
      });
    });
  });

  describe('retireToken', () => {
    let oreBalance;
    let memo;
    let spyTransaction;
    let transaction;

    beforeEach(() => {
      oreBalance = 10;
      memo = `retire ${TOKEN_SYMBOL}`;
      orejs = constructOrejs({ fetch });
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    describe('when authorized', () => {
      it('returns', async () => {
        const result = await orejs.retireToken(ORE_TESTA_ACCOUNT_NAME, oreBalance, ORE_TOKEN_CONTRACT, memo);
        expect(spyTransaction).toHaveBeenCalledWith({ actions: [mockAction({ account: ORE_TOKEN_CONTRACT, name: 'retire' })] }, mockOptions());
      });
    });
  });
});
