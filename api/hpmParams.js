const axios = require('axios')
const auth = require('../util/auth');
const zuora = require('../util/zuoraEndpoints');

const getHpmParams = async (hpmPageId) => {
    let authTokenResponse = await auth.getAuthToken();
    let access_token = authTokenResponse.data.access_token;

    let response = await axios({
      method: 'post',
      url: zuora.ENDPOINT + '/v1/rsa-signatures',
      data: {
        method: 'POST',
        uri: zuora.HPM_URI,
        pageId: hpmPageId
      },
      headers: {
        'content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      }
    });
    return response.data;
}

exports.getHpmParams = getHpmParams;
