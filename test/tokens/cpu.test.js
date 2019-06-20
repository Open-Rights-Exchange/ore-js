/* global ORE_NETWORK_URI:true */
/* global ORE_OWNER_ACCOUNT_NAME:true */
/* global ORE_TESTA_ACCOUNT_NAME:true */
/* global ORE_TESTB_ACCOUNT_NAME:true */
import { expectFetch, mock, mockInfo } from '../helpers/fetch';
import { mockAction, mockOptions } from '../helpers/eos';
import { constructOrejs, mockGetBlock, mockGetInfo, mockGetTransaction } from '../helpers/orejs';

describe('cpu', () => {
  let orejs;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('getCpuBalance', () => {
    let cpuBalance;

    beforeEach(() => {
      cpuBalance = 30;

      fetch.resetMocks();
      fetch.mockResponses(mock([`${cpuBalance}.0000 CPU`]));
      orejs = constructOrejs({ fetch });
    });

    it('returns the cpu balance', async () => {
      cpuBalance = await orejs.getCpuBalance(ORE_TESTA_ACCOUNT_NAME);
      expectFetch(`${ORE_NETWORK_URI}/v1/chain/get_currency_balance`);
      expect(cpuBalance).toEqual(cpuBalance);
    });
  });

  describe('approveCpu', () => {
    let cpuBalance;
    let memo;
    let spyTransaction;
    let transaction;

    beforeEach(() => {
      memo = 'approve CPU transfer';
      cpuBalance = 10;
      fetch.resetMocks();
      fetch.mockResponses(mock([`${cpuBalance}.0000 CPU`]));
      orejs = constructOrejs({ fetch });
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    describe('when authorized', () => {
      it('returns', async () => {
        mockGetInfo(orejs);
        mockGetBlock(orejs);
        const result = await orejs.approveCpu(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, cpuBalance, memo);
        expect(spyTransaction).toHaveBeenCalledWith({ actions: [mockAction({ account: 'token.ore', name: 'approve' })] }, mockOptions());
      });
    });

    describe('when unauthorized', () => {
      xit('throws', () => {
        // contract.approve.mockImplementationOnce(() => Promise.reject(new Error('unauthorized')));
        const result = orejs.approveCpu(ORE_TESTA_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, cpuBalance);
        expect(result).rejects.toThrow(/unauthorized/);
      });
    });
  });

  describe('getApprovedCpuBalance', () => {
    let cpuBalance;
    let memo;
    let spyTransaction;
    let transaction;

    beforeEach(() => {
      cpuBalance = 10;
      memo = 'approve CPU transfer';
      fetch.resetMocks();
    });

    describe('when approved', () => {
      beforeEach(() => {
        fetch.mockResponses(mock([`${cpuBalance}.0000 CPU`]), mock({
          rows: [{
            to: ORE_TESTA_ACCOUNT_NAME,
            quantity: '10.0000 CPU'
          }]
        }));
        orejs = constructOrejs({ fetch });
        transaction = mockGetTransaction(orejs);
      });

      it('returns', async () => {
        mockGetInfo(orejs);
        mockGetBlock(orejs);
        await orejs.approveCpu(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, cpuBalance, memo);
        const approveAmount = await orejs.getApprovedCpuBalance(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME);
        expect(approveAmount).toEqual(`${cpuBalance}.0000 CPU`);
      });
    });

    describe('when not approved', () => {
      beforeEach(() => {
        fetch.mockResponses(mock({
          rows: [{
            to: ORE_TESTB_ACCOUNT_NAME,
            quantity: '0.0000 CPU'
          }]
        }));
        orejs = constructOrejs({ fetch });
      });

      it('returns', async () => {
        const approveAmount = await orejs.getApprovedCpuBalance(ORE_OWNER_ACCOUNT_NAME, ORE_TESTB_ACCOUNT_NAME);
        expect(approveAmount).toEqual('0.0000 CPU');
      });
    });
  });

  describe('transferCpu', () => {
    let cpuBalance;
    let spyTransaction;
    let transaction;

    beforeEach(() => {
      cpuBalance = 10;
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    describe('when authorized', () => {
      it('returns', async () => {
        const result = await orejs.transferCpu(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, cpuBalance);
        expect(spyTransaction).toHaveBeenCalledWith({ actions: [mockAction({ account: 'token.ore', name: 'transfer' })] }, mockOptions());
      });
    });

    describe('when unauthorized', () => {
      xit('throws', () => {
        contract.approve.mockImplementationOnce(() => Promise.reject(new Error('unauthorized')));

        const result = orejs.transferCpu(ORE_TESTA_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, cpuBalance);
        expect(result).rejects.toThrow(/unauthorized/);
      });
    });
  });
});
