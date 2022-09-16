require("dotenv").config();

const http = require("http");
const url = require("url");
const fs = require("fs");
const inv = require("./api/invoices");
const hpm = require("./api/hpmParams");
const stripeHandler = require("./api/stripeHandler");
const jsonBody = require("body/json");

const WEBSERVER_PORT = 3200;

const onRequest = async (request, response) => {
    let pathName = url.parse(request.url).pathname;
    let queryParams = url.parse(request.url, true).query;
    console.log("onRequest:pathname: " + pathName);

    switch (pathName) {
        case "/":
            // draw the main page with invoices and hpm
            let indexHtml = fs.readFileSync("./pages/index.html", "utf8");
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(indexHtml);
            response.end();
            break;
        case "/checkout":
            // draw the direct post form
            let checkoutHtml = fs.readFileSync("./pages/checkout.html", "utf8");
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(checkoutHtml);
            response.end();
            break;
        case "/pages/checkout_handler.js":
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(
                fs.readFileSync("./pages/checkout_handler.js", "utf8")
            );
            response.end();
            break;
        case "/pages/stuff.js":
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(fs.readFileSync("./pages/stuff.js", "utf8"));
            response.end();
            break;
        case "/pages/confirm3ds.js":
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(fs.readFileSync("./pages/confirm3ds.js", "utf8"));
            response.end();
            break;
        case "/pages/confirm3ds":
            let confirm3dsHtml = fs.readFileSync(
                "./pages/confirm3ds.html",
                "utf8"
            );
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(confirm3dsHtml);
            response.end();
            break;
        case "/api/setupPaymentMethod":
            console.log(queryParams.card);
            let paymentMethod = await stripeHandler.setupPaymentMethod(
                JSON.parse(queryParams.card)
            );
            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(JSON.stringify(paymentMethod));
            response.end();
            break;
        case "/api/setupIntends":
            let setupIntend = await stripeHandler.setupIntends(
                queryParams.paymentMethodId
            );
            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(JSON.stringify(setupIntend));
            response.end();
            break;
        case "/api/retrieveSetupIntent":
            let retrieveSetupIntent = await stripeHandler.retrieveSetupIntent(
                queryParams.setupIntentsId
            );
            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(JSON.stringify(retrieveSetupIntent));
            response.end();
            break;
        case "/api/hpmParams":
            // call backend to get hpmParams (including refreshed access tokens)
            let hpmParams = await hpm.getHpmParams(
                queryParams.zuoraAccountId,
                queryParams.useDarkHPM == "true"
            );
            console.log(hpmParams);
            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(JSON.stringify({ hpmParams: hpmParams }));
            response.end();
            break;
        case "/api/invoices":
            // call backend to get the list of invoices
            let invoices = await inv.getInvoices(queryParams.zuoraAccountId);
            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(JSON.stringify({ invoices: invoices }));
            response.end();
            break;
        case "/api/payInvoices":
            // call backend to pay a list of invoices
            jsonBody(request, response, async function (err, body) {
                if (!err) {
                    let invoicesToPay = body;
                    let payInvoicesResult = await inv.payInvoices(
                        queryParams.zuoraAccountId,
                        queryParams.paymentMethodId,
                        invoicesToPay
                    );
                    response.writeHead(200, {
                        "Content-Type": "application/json",
                    });
                    response.write(
                        JSON.stringify({ payInvoicesResult: payInvoicesResult })
                    );
                    response.end();
                }
            });
            break;
        case "/api/zuoraAccount":
            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(
                JSON.stringify({ zuoraAccountId: process.env.ZUORA_ACCOUNT_ID })
            );
            response.end();
            break;
        case "/callback":
            // draw the direct post form
            let callbackHtml = fs.readFileSync("./pages/callback.html", "utf8");
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(callbackHtml);
            response.end();
            break;
        case "/pages/callback.js":
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(fs.readFileSync("./pages/callback.js", "utf8"));
            response.end();
            break;
        default:
            response.writeHead(404, { "Content-Type": "text/html" });
            response.write("404 Page not found");
            response.end();
            break;
    }
};

http.createServer(onRequest).listen(WEBSERVER_PORT, () => {
    console.log(`Server has started - listening on ${WEBSERVER_PORT}`);
});
