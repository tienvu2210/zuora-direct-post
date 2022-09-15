require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_TEST_PUBLIC_KEY);

const setupPaymentMethod = async () => {
    await stripe.set;
};

exports.setupPaymentMethod = setupPaymentMethod;
