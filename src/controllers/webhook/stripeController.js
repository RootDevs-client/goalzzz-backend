const express = require("express");
const StripePay = require("../../services/stripePay");
const User = require("../../models/User");
const Payment = require("../../models/Payment");
const addTime = require("../../helpers/addTime");
const { unsubscribeUserFromStarGame, extendUserSubscriptionToStarGame, registerUserToStarGame } = require("../proxyCom/stargamez");

const stripeRouter = express.Router();

const stripe = new StripePay(process.env.STRIPE_SECRET_KEY);

const IS_DEV = process.env.NODE_ENV === "development";

stripeRouter.post("/", express.raw({ type: "application/json" }), async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.stripe.webhooks.constructEvent(req.body, sig, process.env.ENDPOINT_SECRET);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const metadata = event.data.object?.metadata;
    if (!metadata) {
      res.status(400).send("Missing metadata in the checkout session");
      return;
    }

    const { userId, paymentId } = metadata;

    let user = await User.findById(userId).populate("subscription");
    let payment = await Payment.findById(paymentId).populate("subscription");

    const { customer, invoice, subscription } = event.data.object;

    let invoiceRes;

    switch (event.type) {
      case "checkout.session.async_payment_failed":
        payment.trxnId = event.data?.object?.id;
        payment.status = "failed";
        payment.save();
        break;
      case "checkout.session.async_payment_succeeded":
        invoiceRes = await stripe.retrieveInvoiceInfo(invoice);

        user.paymentMethod = invoiceRes?.payment_intent?.payment_method?.card.brand;
        user.expiresAt = addTime(user?.expiresAt, user?.subscription?.duration_type || payment?.subscription?.duration_type);
        user.SubscribedAt = Date.now().toString();
        user.paid = true;
        user.stripeCustomerId = customer;
        user.subscriptionId = subscription;
        await user.save();
        payment.status = "completed";
        payment.trxnId = event.data?.object?.id;
        await payment.save();
        !IS_DEV &&
          (await registerUserToStarGame({
            phone: user.phone,
            password: user.rawPassword,
            plan: payment.subscription.title,
            expDate: user.expiresAt
          }));
        break;
      case "checkout.session.completed":
        invoiceRes = await stripe.retrieveInvoiceInfo(invoice);
        user.paymentMethod = invoiceRes?.payment_intent?.payment_method?.card.brand;
        user.expiresAt = addTime(user?.expiresAt, user?.subscription?.duration_type || payment?.subscription?.duration_type);
        user.SubscribedAt = Date.now().toString();
        user.paid = true;
        user.stripeCustomerId = customer;
        user.subscriptionId = subscription;
        await user.save();
        payment.trxnId = event.data?.object?.id;
        payment.status = "completed";
        await payment.save();
        !IS_DEV &&
          (await registerUserToStarGame({
            phone: user.phone,
            password: user.rawPassword,
            plan: payment.subscription.title,
            expDate: user.expiresAt
          }));
        break;
      case "checkout.session.expired":
        payment.trxnId = event.data?.object?.id;
        payment.status = "expired";
        payment.save();
        break;
      case "customer.subscription.deleted":
        user = await User.findOne({ stripeCustomerId: event.data.object.customer });
        // user.subscription = undefined;
        // user.paid = false;
        // user.expiresAt = "";
        user.stripeCustomerId = "";
        user.subscriptionId = "";
        // !IS_DEV &&
        //   (await unsubscribeUserFromStarGame({
        //     phone: user.phone,
        //     reference: user?.reference,
        //   }));
        await user.save();
      case "invoice.payment_succeeded":
        try {
          invoiceRes = await stripe.retrieveInvoiceInfo(event?.data?.object?.id);
          if (invoiceRes?.billing_reason === "subscription_update" || invoiceRes?.billing_reason === "subscription_cycle") {
            user = await User.findOne({
              stripeCustomerId: invoiceRes.customer
            }).populate("subscription");
            user.expiresAt = addTime(user?.expiresAt, user?.subscription?.duration_type);
            user.paid = true;
            await user.save();
            !IS_DEV &&
              (await extendUserSubscriptionToStarGame({
                phone: user.phone,
                expDate: user.expiresAt
              }));
          }
          break;
        } catch (err) {
          console.log(err.message);
        }

      default:
    }
    return res.status(200).send("ok");
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = stripeRouter;
