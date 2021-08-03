const axios = require('axios')
const auth = require('../util/auth');
const zuora = require('../util/zuoraEndpoints');

const getInvoices = async (zuoraAccountId) => {
    let authTokenResponse = await auth.getAuthToken();
    let access_token = authTokenResponse.data.access_token;

    let response = await axios({
        method: 'get',
        url: zuora.ENDPOINT + '/v1/billing-documents?accountId=' + zuoraAccountId,
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    });
    var invoices = []
    for (let idx in response.data.documents) {
        let billingDocument = response.data.documents[idx]
        if ('Invoice' == billingDocument.documentType) {
            invoices.push(billingDocument)
        }
    }
    return invoices
}

exports.getInvoices = getInvoices;
