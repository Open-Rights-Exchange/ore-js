const APIM_CONTRACT_NAME = 'manager.acnt';

async function createOfferInstrument(oreAccountName, offerData, confirm = false) {
  // Create an offer
  const {
    issuer,
    api_voucher_license_price_in_cpu,
    api_voucher_lifetime_in_seconds,
    api_voucher_start_date,
    api_voucher_end_date,
    api_voucher_valid_forever,
    api_voucher_mutability,
    api_voucher_security_type,
    right_params,
    api_voucher_parameter_rules,
    offer_mutability,
    offer_security_type,
    offer_template,
    offer_start_time,
    offer_end_time,
    offer_override_id
  } = offerData;
  const actions = [{
    account: APIM_CONTRACT_NAME,
    name: 'publishapi',
    authorization: [{
      actor: oreAccountName,
      permission: 'active',
    }],
    data: {
      creator: oreAccountName,
      issuer,
      api_voucher_license_price_in_cpu,
      api_voucher_lifetime_in_seconds,
      api_voucher_start_date,
      api_voucher_end_date,
      api_voucher_valid_forever,
      api_voucher_mutability,
      api_voucher_security_type,
      right_params,
      api_voucher_parameter_rules,
      offer_mutability,
      offer_security_type,
      offer_template,
      offer_start_time,
      offer_end_time,
      offer_override_id,
    },
  }];
  if (confirm) {
    return this.awaitTransaction(() => this.transact(actions));
  }

  return this.transact(actions);
}

module.exports = {
  createOfferInstrument,
};
