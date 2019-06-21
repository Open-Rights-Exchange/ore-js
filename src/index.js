// JsSignatureProvider is used in Frontend only, not safe for private keys and signing
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import fetch from 'node-fetch';
import eosjs from 'eosjs';
import { TextDecoder, TextEncoder } from 'text-encoding';
import accounts from './accounts';
import creatbridge from './createbridge';
import crypto from './modules/crypto';
import eos from './eos';
import instrument from './instrument';
import ore from './tokens/ore';
import oreStandardToken from './orestandardtoken';
import rightsRegistry from './rightsregistry';
import usageLog from './usagelog';
import verifier from './verifier';
import cpu from './tokens/cpu';

class Orejs {
  constructor(config = {}) {
    this.constructEos(config);

    /* Mixins */
    Object.assign(this, accounts);
    Object.assign(this, cpu);
    Object.assign(this, creatbridge);
    Object.assign(this, crypto);
    Object.assign(this, eos);
    Object.assign(this, instrument);
    Object.assign(this, ore);
    Object.assign(this, oreStandardToken);
    Object.assign(this, rightsRegistry);
    Object.assign(this, usageLog);
    Object.assign(this, verifier);
  }

  constructEos(config) {
    this.config = config;
    this.chainName = config.chainName || 'ore'; // ore || eos
    this.rpc = new eosjs.JsonRpc(config.httpEndpoint, { fetch: config.fetch || fetch });
    this.signatureProvider = config.signatureProvider || new JsSignatureProvider(config.privateKeys || []);
    this.eos = new eosjs.Api({
      chainId: config.chainId,
      rpc: this.rpc,
      signatureProvider: this.signatureProvider,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    });
  }
}

const generateAccountNameString = accounts.generateAccountNameString;

export default {
  crypto,
  generateAccountNameString,
  Orejs,
  JsSignatureProvider
};
