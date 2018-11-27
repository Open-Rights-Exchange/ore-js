const APIM_CONTRACT_NAME = 'manager.acnt';

const ecc = require('eosjs-ecc');

function createVoucherInstrument(creator, buyer, offer_id, override_voucher_id = 0, offer_template = '', api_voucher_additional_url_params = [], voucher_encrypted_by = '', confirm = false) {
  // Exercise an offer to get a voucher
  // overrideVoucherId is passed in to specify the voucher id for the new voucher. If its value is 0, then the voucher id is auto generated
  // either offerTemplate or offerId could be passed in to get a voucher for that offer.
  if (offer_id === 0 && offer_template === '') {
    throw new Error('Either pass in a valid offer id or a valid offer template');
  }
  const actions = [{
    account: APIM_CONTRACT_NAME,
    name: 'licenseapi',
    authorization: [{
      actor: creator,
      permission: 'active',
    }],
    data: {
      creator,
      buyer,
      offer_id,
      offer_template,
      api_voucher_additional_url_params,
      voucher_encrypted_by,
      override_voucher_id,
    }
  }];
  if (confirm) {
    return this.awaitTransaction(() => this.transact(actions));
  }
  return this.transact(actions);
}

async function signVoucher(voucherId) {
  return ecc.sign(voucherId.toString(), this.config.keyProvider[0]);
}

module.exports = {
  createVoucherInstrument,
  signVoucher,
};