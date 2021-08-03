require('dotenv').config();

const http = require('http')
const url = require('url')
const fs = require('fs')
const inv = require('./api/invoices')
const hpm = require('./api/hpmParams')
const jsonBody = require('body/json')

const onRequest = async(request, response) => {
    let pathName = url.parse(request.url).pathname
    let queryParams = url.parse(request.url,true).query
    console.log('onRequest:pathname: ' + pathName);

    let zuoraAccountId = process.env.ZUORA_ACCOUNT_ID
    let hpmPageId = process.env.ZUORA_HPM_PAGE_ID

    switch (pathName) {
        case '/' :
            // draw the main page with invoices and hpm
            let indexHtml = fs.readFileSync('./pages/index.html', 'utf8')
            response.writeHead(200, {'Content-Type': 'text/html'})
            response.write(indexHtml);
            response.end();
            break;
        case '/api/hpmParams' :
            // call backend to get hpmParams (including refreshed access tokens)
            let hpmParams = await hpm.getHpmParams(hpmPageId);
            response.writeHead(200, {'Content-Type': 'application/json'})
            response.write(JSON.stringify({hpmParams: hpmParams}));
            response.end();
            break;
        case '/api/invoices' :
            // call backend to get the list of invoices
            let invoices = await inv.getInvoices(zuoraAccountId);
            response.writeHead(200, {'Content-Type': 'application/json'})
            response.write(JSON.stringify({invoices: invoices}));
            response.end();
            break;
        case '/api/payInvoices' :
            // call backend to pay a list of invoices
            jsonBody(request, response, function (err, body) {
                if (!err) {
                    let invoicesToPay = body
                    let payInvoicesResult = inv.payInvoices(zuoraAccountId, queryParams.paymentMethodId, invoicesToPay);
                    response.writeHead(200, {'Content-Type': 'application/json'})
                    response.write(JSON.stringify({payInvoicesResult: payInvoicesResult}));
                    response.end();
                }
            })
            break;
        default:
            response.writeHead(404, {'Content-Type': 'text/html'})
            response.write('404 Page not found');
            response.end();
            break;
    }
}

http.createServer(onRequest).listen(8080);
console.log('Server has started');
