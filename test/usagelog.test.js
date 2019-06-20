/* global ORE_TESTA_ACCOUNT_NAME:true */
/* global ORE_NETWORK_URI:true */

import { expectFetch, mock, mockInstruments } from './helpers/fetch';
import { constructOrejs } from './helpers/orejs';

describe('usagelog', () => {
  let orejs;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('getRightStats', () => {
    let rightName;
    let totalCpu;
    let totalCount;

    beforeEach(() => {
      rightName = 'com.company.right';
      totalCpu = 10;
      totalCount = 20;

      fetch.resetMocks();
      fetch.mockResponses(
        mockInstruments([
          { owner: ORE_TESTA_ACCOUNT_NAME, instrument: { rights: [{ right_name: rightName }] } },
          { owner: ORE_TESTA_ACCOUNT_NAME, instrument: { rights: [{ right_name: rightName }] } }
        ]),
        mock({ rows: [{ right_name: rightName, total_cpu: `${totalCpu}.0000 CPU`, total_count: totalCount }] }),
        mock({ rows: [{ right_name: rightName, total_cpu: `${totalCpu}.0000 CPU`, total_count: totalCount }] }),
      );
      orejs = constructOrejs({ fetch });
    });

    it('returns summed stats', async () => {
      const stats = await orejs.getRightStats(rightName, ORE_TESTA_ACCOUNT_NAME);
      expectFetch(`${ORE_NETWORK_URI}/v1/chain/get_table_rows`, `${ORE_NETWORK_URI}/v1/chain/get_table_rows`, `${ORE_NETWORK_URI}/v1/chain/get_table_rows`);
      expect(stats).toEqual({ totalCpuUsage: totalCpu * 2, totalCalls: totalCount * 2 });
    });
  });
});
