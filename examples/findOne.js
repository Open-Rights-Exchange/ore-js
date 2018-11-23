let orejs = require('./index').orejs();

(async () => {
  // Grab the current chain id...
  const info = await orejs.eos.rpc.get_info({});
  console.log('Connecting to chain:', info.chain_id, '...');
  process.env.CHAIN_ID = info.chain_id;

  // Reinitialize the orejs library, with the appropriate chain id...
  orejs = require('./index').orejs();

  //let row = await orejs.findOne('instr.ore', 'tokens', '');
  const rows = await orejs.eos.rpc.get_table_rows({
    code: 'instr.ore',
    json: true,
    limit: 1,
    lower_bound: '1oukorfawm5a',
    scope: 'instr.ore',
    table: 'tokens',
    index_position: 2,
    key_type: 'name',
    upper_bound: '',
    encode_type: "dec",
  });

  console.log("Rows:", rows);
})();
