const fetch = require('node-fetch');
const hash = require('hash.js');
const ecc = require('eosjs-ecc');

// hash the parameter values to be sent to the verifier
function hashParams(params) {
  const hashedParams = {};
  Object.keys(params).map((key) => {
    hashedParams[key] = hash.sha256().update(params[key]).digest('hex');
  });
  return hashedParams;
}

// Call the Verifier to verify the client request and return an ore-access-token to access a particular right
async function getAccessTokenFromVerifier(verifierEndpoint, instrument, right, hashedParams) {
  let errorTitle;
  let errorMessage;
  let result;
  const signature = await this.sign(instrument.id);

  const options = {
    method: 'POST',
    body: JSON.stringify({
      requestParams: hashedParams,
      rightName: right.right_name,
      signature,
      voucherId: instrument.id
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Call the Verifier to approve the request
  try {
    result = await fetch(`${verifierEndpoint}/verify`, options);

    if (!result.ok) {
      const error = await result.json();
      throw new Error(error.message);
    }
  } catch (error) {
    errorTitle = 'Orejs Verifier Fetch Error';
    throw new Error(`${errorTitle}: ${error.message}`);
  }

  const { endpoint, oreAccessToken, method, additionalParameters, accessTokenTimeout } = await result.json();


  if (!oreAccessToken) {
    errorTitle = 'Orejs Access Token Verification Error';
    errorMessage = 'Verifier is unable to return an ORE access token. Make sure a valid instrument is passed to the verifier.';
    throw new Error(`${errorTitle}: ${errorMessage}`);
  }

  if (!endpoint) {
    errorTitle = 'Orejs Access Right Verification Error';
    errorMessage = 'Verifier is unable to find an endpoint for the right name passed in. Make sure to pass in the correct right name you want to access.';
    throw new Error(`${errorTitle}: ${errorMessage}`);
  }

  return { endpoint, oreAccessToken, method, additionalParameters, accessTokenTimeout };
}

module.exports = {
  getAccessTokenFromVerifier,
  hashParams
};
