require("dotenv").config();

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SECRET_KEY);

const setupPaymentMethod = async (card) => {
    const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: card,
    });
    return paymentMethod;
};

const setupIntends = async (paymentMethodId) => {
    // return new Promise((resolve, _) => {
    //     resolve({ paymentMethodId: paymentMethodId });
    // });
    const setupIntent = await stripe.setupIntents.create({
        confirm: true,
        payment_method_types: ["card"],
        payment_method: paymentMethodId,
        usage: "off_session",
        return_url: "http://localhost:3200/pages/confirm3ds",
    });
    return setupIntent;
};

const retrieveSetupIntent = async (setupIntentsId) => {
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentsId, {
        expand: ["latest_attempt"],
    });
    return setupIntent;
};

exports.setupPaymentMethod = setupPaymentMethod;
exports.setupIntends = setupIntends;
exports.retrieveSetupIntent = retrieveSetupIntent;
