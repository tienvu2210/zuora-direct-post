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

function formatDate(date) {
    dateStr = date.getFullYear() + '-'
    if ((date.getMonth()+1)<10) {
        dateStr += '0'
    }
    dateStr += (date.getMonth() + 1) + '-'
    if (date.getDate()<10) {
        dateStr += '0'
    }
    dateStr += date.getDate();
    return dateStr;
}

const payInvoices = async (zuoraAccountId, paymentMethodId, invoicesToPay) => {
    let authTokenResponse = await auth.getAuthToken();
    let access_token = authTokenResponse.data.access_token;

    let statusResponse = []

    for (idx in invoicesToPay) {
        let invoiceId = invoicesToPay[idx].id
        let invoiceBalance = invoicesToPay[idx].balance

        let response = await axios({
            method: 'post',
            url: zuora.ENDPOINT + '/v1/object/payment',
            data: {
                AccountId: zuoraAccountId,
                AppliedCreditBalanceAmount: 0,
                AppliedInvoiceAmount: invoiceBalance,
                Amount: invoiceBalance,
                InvoiceId: invoiceId,
                PaymentMethodId: paymentMethodId,
                Type: 'Electronic',
                Status: 'Processed',
                EffectiveDate: formatDate(new Date())
            },
            headers: {
                'content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            }
        });
        statusResponse.push({invoiceId: invoiceId, status: response.data.Success})
    }

    return statusResponse
}

exports.getInvoices = getInvoices;
exports.payInvoices = payInvoices;
