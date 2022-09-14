require("dotenv").config();

const axios = require("axios");
const qs = require("qs");
const zuora = require("./zuoraEndpoints");

const getAuthToken = async () => {
    let response = await axios({
        method: "post",
        url: zuora.ENDPOINT + "/oauth/token",
        data: qs.stringify({
            client_id: process.env.ZUORA_CLIENT_ID,
            client_secret: process.env.ZUORA_CLIENT_SECRET,
            grant_type: "client_credentials",
        }),
        headers: {
            "content-Type": "application/x-www-form-urlencoded",
        },
    });
    return response;
};

exports.getAuthToken = getAuthToken;
