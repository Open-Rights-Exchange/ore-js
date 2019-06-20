/* global ORE_OWNER_ACCOUNT_NAME:true */
/* global ORE_TESTA_ACCOUNT_NAME:true */
/* global ORE_NETWORK_URI:true */

import { expectFetch, mock, mockInstrument, mockInstruments } from './helpers/fetch';
import { constructOrejs } from './helpers/orejs';

describe('instrument', () => {
  let orejs;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('findInstruments', () => {
    let instrumentMocks;
    let active;
    let additionalRighted;
    let expired;
    let uncategorized;

    beforeEach(() => {
      active = {
        owner: ORE_TESTA_ACCOUNT_NAME
      };
      expired = {
        owner: ORE_TESTA_ACCOUNT_NAME,
        end_time: Math.floor(Date.now() / 1000) - 10
      };
      uncategorized = {
        owner: ORE_TESTA_ACCOUNT_NAME,
        instrument: {
          instrument_class: 'company.uncategorized'
        }
      };
      additionalRighted = {
        owner: ORE_TESTA_ACCOUNT_NAME,
        instrument: {
          instrument_class: 'company.uncategorized',
          rights: [{
            right_name: 'company.nobody.licenseApi'
          }]
        }
      };

      instrumentMocks = mockInstruments([
        active,
        additionalRighted,
        expired,
        uncategorized
      ]);

      fetch.resetMocks();
      fetch.mockResponses(instrumentMocks);
      orejs = constructOrejs({ fetch });
    });

    it('returns all active instruments for account', async () => {
      const instruments = await orejs.findInstruments(ORE_TESTA_ACCOUNT_NAME);
      expectFetch(`${ORE_NETWORK_URI}/v1/chain/get_table_rows`);
      expect(instruments).toEqual([JSON.parse(instrumentMocks[0]).rows[0], JSON.parse(instrumentMocks[0]).rows[1], JSON.parse(instrumentMocks[0]).rows[3]]);
    });

    it('returns all instruments', async () => {
      const instruments = await orejs.findInstruments(ORE_TESTA_ACCOUNT_NAME, false);
      expectFetch(`${ORE_NETWORK_URI}/v1/chain/get_table_rows`);
      expect(instruments).toEqual([JSON.parse(instrumentMocks[0]).rows[0], JSON.parse(instrumentMocks[0]).rows[1], JSON.parse(instrumentMocks[0]).rows[2], JSON.parse(instrumentMocks[0]).rows[3]]);
    });

    it('filters by category', async () => {
      const instruments = await orejs.findInstruments(ORE_TESTA_ACCOUNT_NAME, true, 'company.uncategorized');
      expectFetch(`${ORE_NETWORK_URI}/v1/chain/get_table_rows`);
      expect(instruments).toEqual([JSON.parse(instrumentMocks[0]).rows[1], JSON.parse(instrumentMocks[0]).rows[3]]);
    });

    it('filters by right', async () => {
      const instruments = await orejs.findInstruments(ORE_TESTA_ACCOUNT_NAME, true, 'company.uncategorized', 'company.nobody.licenseApi');
      expectFetch(`${ORE_NETWORK_URI}/v1/chain/get_table_rows`);
      expect(instruments).toEqual([JSON.parse(instrumentMocks[0]).rows[1]]);
    });
  });

  describe('getRight', () => {
    let instrument;
    let rightName;
    let rights;

    beforeEach(() => {
      rightName = 'company.somebody.licenseApi';
    });

    describe('when multiple rights exist', async () => {
      beforeEach(() => {
        rights = [{
          right_name: 'company.left.licenseApi'
        }, {
          right_name: rightName
        }, {
          right_name: 'company.right.licenseApi'
        }];
        instrument = mockInstrument({
          owner: ORE_TESTA_ACCOUNT_NAME,
          instrument: {
            instrument_class: 'company.uncategorized',
            rights
          }
        });
      });

      it('returns the correct right', async () => {
        const right = await orejs.getRight(instrument, rightName);
        expect(right).toEqual(instrument.instrument.rights[1]);
      });
    });

    describe('when the right does not exist', async () => {
      beforeEach(() => {
        rights = [{
          right_name: 'company.left.licenseApi'
        }, {
          right_name: 'company.right.licenseApi'
        }];
        instrument = mockInstrument({
          owner: ORE_TESTA_ACCOUNT_NAME,
          instrument: {
            instrument_class: 'company.uncategorized',
            rights
          }
        });
      });

      it('returns nothing', async () => {
        const right = await orejs.getRight(instrument, rightName);
        expect(right).toEqual(undefined);
      });
    });
  });
});
