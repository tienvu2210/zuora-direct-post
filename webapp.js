require('dotenv').config();

const http = require('http')
const url = require('url')
const fs = require('fs')
const inv = require('./api/invoices')
const hpm = require('./api/hpmParams')
const jsonBody = require('body/json')

const WEBSERVERPORT = 3200

const onRequest = async(request, response) => {
    let pathName = url.parse(request.url).pathname
    let queryParams = url.parse(request.url,true).query
    console.log('onRequest:pathname: ' + pathName);

    switch (pathName) {
        case '/' :
            // draw the main page with invoices and hpm
            let indexHtml = fs.readFileSync('./pages/index.html', 'utf8')
            response.writeHead(200, {'Content-Type': 'text/html'})
            response.write(indexHtml);
            response.end();
            break;
        case '/pages/stuff.js':
            response.writeHead(200, {'Content-Type': 'text/html'})
            response.write(fs.readFileSync('./pages/stuff.js', 'utf8'));
            response.end();
            break;
        case '/api/hpmParams' :
            // call backend to get hpmParams (including refreshed access tokens)
            let hpmParams = await hpm.getHpmParams(queryParams.zuoraAccountId, queryParams.useDarkHPM == 'true');
            console.log(hpmParams);
            response.writeHead(200, {'Content-Type': 'application/json'})
            response.write(JSON.stringify({hpmParams: hpmParams}));
            response.end();
            break;
        case '/api/invoices' :
            // call backend to get the list of invoices
            let invoices = await inv.getInvoices(queryParams.zuoraAccountId);
            response.writeHead(200, {'Content-Type': 'application/json'})
            response.write(JSON.stringify({invoices: invoices}));
            response.end();
            break;
        case '/api/payInvoices' :
            // call backend to pay a list of invoices
            jsonBody(request, response, async function (err, body) {
                if (!err) {
                    let invoicesToPay = body
                    let payInvoicesResult = await inv.payInvoices(queryParams.zuoraAccountId, queryParams.paymentMethodId, invoicesToPay);
                    response.writeHead(200, {'Content-Type': 'application/json'})
                    response.write(JSON.stringify({payInvoicesResult: payInvoicesResult}));
                    response.end();
                }
            })
            break;
        case '/api/zuoraAccount' :
            response.writeHead(200, {'Content-Type': 'application/json'})
            response.write(JSON.stringify({zuoraAccountId: process.env.ZUORA_ACCOUNT_ID}));
            response.end();
            break;
        default:
            response.writeHead(404, {'Content-Type': 'text/html'})
            response.write('404 Page not found');
            response.end();
            break;
    }
}

const hostname = '127.0.0.1';
http.createServer(onRequest).listen(WEBSERVERPORT, hostname, () => {
    console.log(`Server has started - listening on ${WEBSERVERPORT}`);
});
