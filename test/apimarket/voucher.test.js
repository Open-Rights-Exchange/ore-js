const { mockAction, mockOptions } = require('../helpers/eos');
const { constructOrejs, mockGetBlock, mockGetInfo, mockGetTransaction } = require('../helpers/orejs');

describe('voucher', () => {
  let orejs;

  beforeAll(() => {
    orejs = constructOrejs();
  });

  describe('createVoucherInstrument', () => {
    let offerId;
    let offerTemplate;
    let overrideVoucherId;
    let options;
    let spyTransaction;
    let transaction;

    beforeEach(() => {
      offerId = 1;
      offerTemplate = '';
      overrideVoucherId = 0;
      transaction = mockGetTransaction(orejs);
      spyTransaction = jest.spyOn(orejs.eos, 'transact');
    });

    it('returns', async () => {
      mockGetInfo(orejs);
      mockGetBlock(orejs);
      await orejs.createVoucherInstrument(ORE_OWNER_ACCOUNT_NAME, ORE_TESTA_ACCOUNT_NAME, offerId);
      expect(spyTransaction).toHaveBeenCalledWith({ actions: [mockAction({ account: 'manager.acnt', name: 'licenseapi' })] }, mockOptions());
    });
  });

  describe('signVoucher', () => {
    it('signs a voucher', async () => {
      const voucherId = 0;
      const sig = await orejs.signVoucher(voucherId);
      expect(sig.toString()).toEqual('SIG_K1_K7SnTcWTVuatvRepJ6vmmiHPEh3WWEYiVPB1nD9MZ3LWz91yUxR5fUWmSmNAAP9Dxs2MeKZuDUFoEVfBiKfRozaG2FzfvH');
    });
  });
});
