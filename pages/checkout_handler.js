function fillDefaultCard() {
    document.getElementById("card_number").value = 4242424242424242;
    document.getElementById("card_expiration_month").value = 01;
    document.getElementById("card_expiration_year").value = 2024;
    document.getElementById("card_ccv").value = 123;
}

function fill3DSCard() {
    document.getElementById("card_number").value = 4000003800000446;
    document.getElementById("card_expiration_month").value = 01;
    document.getElementById("card_expiration_year").value = 2024;
    document.getElementById("card_ccv").value = 123;
}

function buildEncryptedValues(
    creditCardNumber,
    cardSecurityCode,
    creditCardExpirationMonth,
    creditCardExpirationYear
) {
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

getZuoraAccountId = async () => {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/zuoraAccount", false);
    request.setRequestHeader("content-Type", "application/json");
    request.onload = function () {
        zuoraAccountId = JSON.parse(request.responseText).zuoraAccountId;
        document.getElementById("zuoraAccountId").value = zuoraAccountId;
    };
    request.send();
};

loadHpmParams = async (form) => {
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

        form.elements.id.value = hpmParams.id;
        form.elements.tenantId.value = hpmParams.tenantId;
        form.elements.signature.value = hpmParams.signature;
        form.elements.token.value = hpmParams.token;
        form.elements.field_accountId.value = hpmParams.field_accountId;
        form.elements.field_key.value = hpmParams.key;

        window.publicKey = hpmParams.key;
    };
    request.send();
};

const submitDirectPost = async (form) => {
    // Store reference to form to make later code easier to read
    getZuoraAccountId();
    loadHpmParams(form);
    const encryptedValue = buildEncryptedValues(
        form.elements.card_number.value,
        form.elements.card_ccv.value,
        form.elements.card_expiration_month.value,
        form.elements.card_expiration_year.value
    );
    form.elements.encrypted_values.value = encryptedValue;
};

window.onload = () => {
    window.document
        .querySelector("#directpost")
        .addEventListener("submit", (e) => {
            submitDirectPost(e.target);

            // e.preventDefault();
        });
};
