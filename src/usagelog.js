const INSTR_CONTRACT_NAME = 'instr.ore';
const INSTR_USAGE_CONTRACT_NAME = 'usagelog.ore';
const INSTR_TABLE_NAME = 'tokens';
const LOG_COUNT_TABLE_NAME = 'counts';

/* Private */

async function getInstrumentByOwner(owner) {
  const instruments = await this.findInstruments(owner);
  return instruments;
}

/* Public */

async function getInstrumentsByRight(instrumentList, rightName) {
  // Gets all the instruments with a particular right
  const instruments = await instrumentList.filter(instrument => this.getRight(instrument, rightName) !== undefined);
  return instruments;
}

async function getCallStats(instrumentId, rightName) {
  // calls the usagelog contract to get the total number of calls against a particular right
  const result = await this.eos.rpc.get_table_rows({
    code: INSTR_USAGE_CONTRACT_NAME,
    json: true,
    scope: instrumentId,
    table: LOG_COUNT_TABLE_NAME,
    limit: -1
  });

  const rightProperties = {
    totalCalls: 0,
    totalCpuUsage: 0
  };

  const rightObject = await result.rows.find(right => right.right_name === rightName);

  if (rightObject !== undefined) {
    rightProperties.totalCalls = rightObject.total_count;
    rightProperties.totalCpuUsage = rightObject.total_cpu;
  }

  return rightProperties;
}

async function getRightStats(rightName, owner) {
  // Returns the total cpu and calls against a particular right across all the instruments. If owner specified, then returns the total calls and cpu usage for the owner.
  let instruments;
  let rightProperties;

  if (owner) {
    instruments = await getInstrumentByOwner.bind(this)(owner);
  } else {
    instruments = await this.getAllTableRows({
      code: INSTR_CONTRACT_NAME,
      scope: INSTR_CONTRACT_NAME,
      table: INSTR_TABLE_NAME,
      limit: -1
    });
  }

  instruments = await getInstrumentsByRight.bind(this)(instruments, rightName);

  // Get the total cpu calls and cpu count across all the instruments
  const results = instruments.map(async (instrumentObject) => {
    rightProperties = await getCallStats.bind(this)(instrumentObject.id, rightName);
    return rightProperties;
  });

  const value = await Promise.all(results);

  return {
    totalCpuUsage: value.reduce((a, b) => a + parseFloat(b.totalCpuUsage), 0),
    totalCalls: value.reduce((a, b) => a + parseFloat(b.totalCalls), 0)
  };
}

async function updateUsageLog(verifierEndpoint, instrumentId, rightName, oreAccessToken, instrumentCallCost) {
  // Post the usage details for an instrument to the verifier usage log handler
  // Verifier then updates the usage for the instrument on the ORE blockchain
  const signature = await this.sign(instrumentId);
  const options = {
    method: 'POST',
    body: JSON.stringify({
      rightName,
      oreAccessToken,
      signature,
      voucherId: instrumentId,
      amount: instrumentCallCost
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  await fetch(`${verifierEndpoint}/update-usage`, options);
}


module.exports = {
  getCallStats,
  getRightStats,
  getInstrumentsByRight,
  updateUsageLog
};
