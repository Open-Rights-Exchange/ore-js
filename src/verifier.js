const fetch = require('node-fetch')
const hash = require("hash.js")
const ecc = require('eosjs-ecc')

// sign the input data with the user keys
async function sign(data) {
    return ecc.sign(data.toString(), this.config.keyProvider[0]);
}

// hash the parameter values to be sent to the verifier
function hashParams(params) {
    let hashedParams = {}
    Object.keys(params).map(key => {
        hashedParams[key] = hash.sha256().update(params[key]).digest('hex')
    })
    return hashedParams
}

//Call the Verifier to verify the client request and return an ore-access-token to access a particular right
async function getAccessTokenFromVerifier(verifierEndpoint, instrument, right, hashedParams) {
    let errorMessage;
    let result;
    let signature;

    try {
        signature = await this.sign(instrument.id);
    } catch (error) {
        throw new Error(`${error.message}`);
    }

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
        result = await fetch(verifierEndpoint + "/verify", options);

        if (!result.ok) {
            let error = await result.json();
            throw new Error(error.message);
        }
    } catch (error) {
        errorMessage = "Internal Server Error";
        throw new Error(`${errorMessage}:${error.message}`);
    }

    const {
        endpoint,
        oreAccessToken,
        method,
        additionalParameters,
        accessTokenTimeout
    } = await result.json();


    if (!oreAccessToken) {
        errorMessage = "Verifier is unable to return an ORE access token. Make sure a valid voucher is passed to the verifier."
        throw new Error(`${errorMessage}`);
    }

    if (!endpoint) {
        errorMessage = "Verifier is unable to find the Api endpoint. Make sure to pass in the correct right name you want to access."
        throw new Error(`${errorMessage}`);
    }

    return {
        endpoint,
        oreAccessToken,
        method,
        additionalParameters,
        accessTokenTimeout
    };
}

module.exports = {
    sign,
    getAccessTokenFromVerifier,
    hashParams,
}