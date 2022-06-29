require('dotenv').config();

const axios = require('axios')
const auth = require('../util/auth');
const zuora = require('../util/zuoraEndpoints');

const getHpmParams = async (zuoraAccountId, useDarkHPM) => {
    let authTokenResponse = await auth.getAuthToken();
    let access_token = authTokenResponse.data.access_token;

    let hpmPageId = useDarkHPM ? process.env.ZUORA_HPM_PAGE_DARK_ID : process.env.ZUORA_HPM_PAGE_ID

    //  hpmPageId = '8ad08c0f7ed28de4017ed72b66677318' // thilgen - cc test
     //hpmPageId = '8ad0824e7f077622017f0941ebe655bb' // thilgen - cc test dark
//     hpmPageId = '8ad0965d7ef2d783017efb2fbd424328' // thilgen - sepa

    let response = await axios({
      method: 'post',
      url: zuora.ENDPOINT + '/v1/rsa-signatures',
      data: {
        method: 'POST',
        uri: zuora.HPM_URI,
        pageId: hpmPageId,
        accountId: zuoraAccountId
      },
      headers: {
        'content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      }
    });

    let zuoraGatewayName = process.env.ZUORA_GATEWAY_NAME_CC
//    let zuoraGatewayName = process.env.ZUORA_GATEWAY_NAME_SEPA
//     zuoraGatewayName = 'Zuorathon Stripe Gateway'
  //   zuoraGatewayName = 'Zuorathon Stripe Gateway MXP 2'
  
  //  zuoraGatewayName = 'Test Gateway - Zuora'
    // zuoraGatewayName = 'Zuorathon Stripe Gateway BRL'
  //   zuoraGatewayName = 'Zuorathon Stripe Gateway AUD'
    // zuoraGatewayName = 'thilgen - test'


    hpmParams = {}
    hpmParams.signature = response.data.signature
    hpmParams.token = response.data.token
    hpmParams.tenantId = response.data.tenantId
    hpmParams.key = response.data.key
    hpmParams.id = hpmPageId
    hpmParams.field_accountId = zuoraAccountId // must match the value passed into /v1/rsa-signatures endpoint
    hpmParams.paymentGateway = zuoraGatewayName
    hpmParams.url = zuora.HPM_URI
    hpmParams.style = 'inline'
    hpmParams.submitEnabled = 'true'
    hpmParams.locale = 'en'
    //hpmParams.locale = 'en_au'
    hpmParams.param_supportedTypes = 'Visa,MasterCard,Discover'
    //hpmParams.param_supportedTypes = 'MasterCard,Visa,JCB,AmericanExpress,Diners'

    return hpmParams
}

exports.getHpmParams = getHpmParams;
