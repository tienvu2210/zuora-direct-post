// const { getHpmParams } = require("../api/hpmParams")

async function onReloadHPMButton() {
    document.getElementById("zuora_payment").style.display = "block";
    loadHPM();
}
async function onReloadHPMDarkButton() {
    var useDarkHPM = true;
    _loadHPM(useDarkHPM);
}
async function loadHPM() {
    var useDarkHPM = false;
    _loadHPM(useDarkHPM);
}
async function _loadHPM(useDarkHPM) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        var zuoraAccountId = document.getElementById("zuoraAccountId").value;
        request.open(
            "GET",
            `/api/hpmParams?zuoraAccountId=${zuoraAccountId}&useDarkHPM=${useDarkHPM}`,
            false
        );
        request.setRequestHeader("content-Type", "application/json");
        request.onerror = function (e) {
            console.log(e);
            // reject("fuct");
        };

        request.onload = function () {
            hpmParams = JSON.parse(request.responseText).hpmParams;

            Z.setEventHandler("onloadCallback", function () {
                addStatusMsg("HPM Loaded");
            });

            console.log(`Loading HPM Page ID: ${hpmParams.id}`);

            var prepopulateFields = {};
            Z.render(hpmParams, prepopulateFields);
        };
        request.send();
    });
}
async function getZuoraAccountId() {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/zuoraAccount", false);
    request.setRequestHeader("content-Type", "application/json");
    request.onload = function () {
        zuoraAccountId = JSON.parse(request.responseText).zuoraAccountId;
        document.getElementById("zuoraAccountId").value = zuoraAccountId;
    };
    request.send();
}

async function loadHpmParams() {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        var zuoraAccountId = document.getElementById("zuoraAccountId").value;
        request.open(
            "GET",
            `/api/hpmParams?zuoraAccountId=${zuoraAccountId}`,
            false
        );
        request.setRequestHeader("content-Type", "application/json");

        request.onload = function () {
            hpmParams = JSON.parse(request.responseText).hpmParams;

            stuffs = [
                "id",
                "tenantId",
                "signature",
                "token",
                "field_accountId",
            ];

            for (let i = 0; i < stuffs.length; i++) {
                stuff = stuffs[i];
                document.querySelector(`#directpost [name="${stuff}"]`).value =
                    hpmParams[stuff];
            }

            field_stuffs = ["key"];
            for (let i = 0; i < field_stuffs.length; i++) {
                field_stuff = field_stuffs[i];
                document.querySelector(
                    `#directpost [name="field_${field_stuff}"]`
                ).value = hpmParams[field_stuff];
            }

            window.publicKey = hpmParams.key;

            document.querySelector('#directpost [name="id"]').value =
                hpmParams.id;
            document.querySelector('#directpost [name="tenantId"]').value =
                hpmParams.tenantId;
            // document.querySelector('#directpost [name="field_key"]').value = hpmParams.key
            document.querySelector('#directpost [name="signature"]').value =
                hpmParams.signature;

            // const agreement = Z.setAgreement("External","Recurring","Visa","Your_Ref");
            // console.log(`agreement is ${agreement}`);
        };
        request.send();
    });
}

async function onLoadPage() {
    getZuoraAccountId();
    loadHpmParams();
    const encryptedValue = buildEncryptedValues();
    document.querySelector('#directpost [name="encrypted_values"]').value =
        encryptedValue;
    document
        .getElementById("reloadHPMButton")
        .addEventListener("click", onReloadHPMButton);
    document
        .getElementById("reloadHPMDarkButton")
        .addEventListener("click", onReloadHPMDarkButton);
}

function addStatusMsg(msg) {
    document.getElementById("statusText").value += msg + "\r\n";
}

function buildEncryptedValues() {
    // const creditCardNumber = 5555555555554444;
    // const creditCardNumber = 4000002760003184; // always authenticate.
    // const creditCardNumber = 4000003800000446; // Already setup.
    const creditCardNumber = 4242424242424242;
    const cardSecurityCode = 123;
    const creditCardExpirationMonth = 01;
    const creditCardExpirationYear = 2023;

    // 1) Construct credit card data to a string in the desired format
    var unencrypted_values =
        "#" +
        creditCardNumber +
        "#" +
        cardSecurityCode +
        "#" +
        creditCardExpirationMonth +
        "#" +
        creditCardExpirationYear;

    // 2) Base64 encode the string, 3) Encrypt the Base64 string
    // and 4) Base64 encode the encrypted data
    return encryptText(unencrypted_values, window.publicKey);
}

/**
 * encrypt the text using the specified public key.
 * @param text the text to be encrypted.
 * @param key the public key.
 * @returns Base64 encoded encrypted data.
 */
function encryptText(text, key) {
    if (key) {
        try {
            var key = pidCryptUtil.decodeBase64(key);
            var rsa = new pidCrypt.RSA();
            //ASN1 parsing
            var asn = pidCrypt.ASN1.decode(pidCryptUtil.toByteArray(key));
            var tree = asn.toHexTree();

            //setting the public key for encryption with retrieved ASN.1 tree
            rsa.setPublicKeyFromASN(tree);

            // Base64 encode and encrypt the string
            var crypted = rsa.encrypt(text);

            return pidCryptUtil.encodeBase64(
                pidCryptUtil.convertFromHex(crypted)
            );
        } catch (e) {
            console.info(e);
        }
    }
    // return origin text if unable to encrypt
    return text;
}
