/* global ORE_NETWORK_URI:true */
/* global ORE_OWNER_ACCOUNT_NAME:true */
/* global ORE_TESTA_ACCOUNT_NAME:true */
import { expectFetch, mock, mockInfo } from '../helpers/fetch';
import { mockAction, mockOptions } from '../helpers/eos';
import { constructOrejs, mockGetBlock, mockGetInfo, mockGetTransaction } from '../helpers/orejs';

describe('ore', () => {
  let orejs;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('getOreBalance', () => {
    let oreBalance;

    beforeEach(() => {
      oreBalance = 30;

      fetch.resetMocks();
      fetch.mockResponses(mock([`${oreBalance}.0000 ORE`]));
      orejs = constructOrejs({ fetch });
    });

    it('returns the ore balance', async () => {
      oreBalance = await orejs.getOreBalance(ORE_TESTA_ACCOUNT_NAME);
      expect(oreBalance).toEqual(oreBalance);
    });
  });

  describe('transferOre', () => {
    let oreBalance;
    let spyTransaction;
    let transaction;

    beforeEach(() => {
      oreBalance = 10;
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    describe('when authorized', () => {
      it('returns', async () => {
        const result = await orejs.transferOre(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, oreBalance);
        expect(spyTransaction).toHaveBeenCalledWith({ actions: [mockAction({ account: 'eosio.token', name: 'transfer' })] }, mockOptions());
      });
    });

    describe('when unauthorized', () => {
      xit('throws', () => {
        mockGetInfo(orejs);
        mockGetBlock(orejs);
        contract.approve.mockImplementationOnce(() => Promise.reject(new Error('unauthorized')));

        const result = orejs.transferOre(ORE_TESTA_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, oreBalance);
        expect(result).rejects.toThrow(/unauthorized/);
      });
    });
  });
});
