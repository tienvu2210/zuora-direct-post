async function onReloadHPMButton() {
    document.getElementById('zuora_payment').style.display = "block"
    loadHPM()
}
async function onReloadHPMDarkButton() {
    var useDarkHPM = true
    _loadHPM(useDarkHPM)
}
async function loadHPM() {
    var useDarkHPM = false
    _loadHPM(useDarkHPM)
}
async function _loadHPM(useDarkHPM) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        var zuoraAccountId = document.getElementById('zuoraAccountId').value
        request.open('GET', `/api/hpmParams?zuoraAccountId=${zuoraAccountId}&useDarkHPM=${useDarkHPM}`, false);
        request.setRequestHeader('content-Type', 'application/json')
        request.onerror = function(e) {
            console.log(e);
            // reject("fuct");
        }

        request.onload = function () {
            hpmParams = JSON.parse(request.responseText).hpmParams

            Z.setEventHandler('onloadCallback', function () {
                addStatusMsg('HPM Loaded')
            });

            hpmCallback = function (response) {
                document.getElementById('zuora_payment').style.display = "none"
                addStatusMsg('\nloadHPM() callback response\n' + JSON.stringify(response, null, 2) + '\n')
                if (response.success == 'true') {
                    let paymentMethodId = response.refId
                    addStatusMsg('HPM SUCCEEDED - Added PaymentMethod ' + paymentMethodId)
                    let paymentId = response.PaymentId
                    addStatusMsg('HPM SUCCEEDED - Made Payment ' + paymentId)
                    if (document.getElementById('payOpenInvoicesCB').checked) {
                        addStatusMsg('Pay Invoices CB Checked - Attempting Invoice Payment')
                        payOpenInvoices(paymentMethodId)
                    } else {
                        addStatusMsg('Pay Invoices CB Not Checked - Not attempting Invoice Payment')
                    }
                } else {
                    addStatusMsg('HPM FAILED - PaymentMethod Not Added')
                }
            }

            console.log(`Loading HPM Page ID: ${hpmParams.id}`)
            
            /*
            hpmParams.doPayment = true
            hpmParams.storePaymentMethod = false
            hpmParams.documents = []
            for (idx in openInvoices) {
                var openInvoice = openInvoices[idx]
                hpmParams.documents.push({
                    type: 'invoice',
                    ref: openInvoice.documentNumber
                })
            }
            hpmParams.documents = JSON.stringify(hpmParams.documents)
            */

            var prepopulateFields = {}
            /*
            var prepopulateFields = {
                creditCardHolderName: 'Chris Thilgen',
                creditCardAddress1: '123 Main Street',
                creditCardCity: 'San Francisco',
                creditCardState: 'California',
                creditCardPostalCode: '94107',
                creditCardCountry: 'BRA'
            }
            */
            //Z.allowScroll(true);
            Z.render(hpmParams, prepopulateFields, hpmCallback);
        }
        request.send();
    });
}
async function getZuoraAccountId() {
    var request = new XMLHttpRequest();
    request.open('GET', '/api/zuoraAccount', false);
    request.setRequestHeader('content-Type', 'application/json')
    request.onload = function () {
        zuoraAccountId = JSON.parse(request.responseText).zuoraAccountId
        document.getElementById('zuoraAccountId').value = zuoraAccountId
    }
    request.send();
}
async function onLoadPage() {
    getZuoraAccountId()
    document.getElementById('reloadHPMButton').addEventListener('click', onReloadHPMButton)
    document.getElementById('reloadHPMDarkButton').addEventListener('click', onReloadHPMDarkButton)
}
function addStatusMsg(msg) {
    document.getElementById('statusText').value += msg + '\r\n'
}