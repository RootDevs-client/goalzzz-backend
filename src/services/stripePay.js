// const Stripe = require('stripe');

// class StripePay {
//   constructor(secretKey) {
//     this.stripe = new Stripe(secretKey, { apiVersion: '2022-11-15' });
//   }

//   get getInstance() {
//     return this.stripe;
//   }

//   async createCustomer(email, name, paymentMethodId) {
//     const customer = await this.stripe.customers.create({
//       email,
//       name,
//       payment_method: paymentMethodId,
//       invoice_settings: { default_payment_method: paymentMethodId },
//     });
//     return customer;
//   }

//   async createSubscription(customerId, priceId) {
//     const subscription = await this.stripe.subscriptions.create({
//       customer: customerId,
//       items: [{ price: priceId }],
//       expand: ['latest_invoice.payment_intent'],
//     });
//     return subscription;
//   }

//   async cancelSubscription(subscriptionId) {
//     const canceledSubscription = await this.stripe.subscriptions.cancel(subscriptionId);
//     return canceledSubscription;
//   }

//   async updateSubscription(subscriptionId, updates) {
//     const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, updates);
//     return updatedSubscription;
//   }

//   async getSubscription(subscriptionId) {
//     const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
//     return subscription;
//   }

//   handleWebhookEvent(signature, payload, webhookSecret) {
//     try {
//       const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

//       switch (event.type) {
//         case 'invoice.payment_succeeded':
//           console.log('Payment succeeded:', event.data.object);
//           break;
//         case 'invoice.payment_failed':
//           console.log('Payment failed:', event.data.object);
//           break;
//         case 'customer.subscription.deleted':
//           console.log('Subscription canceled:', event.data.object);
//           break;
//         default:
//           console.log(`Unhandled event type: ${event.type}`);
//       }

//       return { success: true, event };
//     } catch (err) {
//       console.error('Webhook error:', err.message);
//       return { success: false, error: err.message };
//     }
//   }

//   async createPrice({ name, price, currency, interval }) {
//     const product = await this.stripe.products.create({ name });
//     const stripePrice = await this.stripe.prices.create({
//       unit_amount: price * 100,
//       currency,
//       recurring: { interval },
//       product: product.id,
//     });
//     return stripePrice;
//   }

//   async createCheckoutSession({ userId, price, interval, productName, paymentId }) {
//     const session = await this.stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: productName
//             },
//             unit_amount: price * 100,
//             recurring: { interval },
//           },
//           quantity: 1,
//         }
//       ],
//       mode: "subscription",
//       payment_method_types: ["card"],
//       success_url: `${process.env.FRONTEND_URL}/success`,
//       cancel_url: `${process.env.FRONTEND_URL}/canceled`,
//       metadata: {
//         userId,
//         paymentId,
//       }
//     });
//     return session;
//   }

//   async retrieveInvoiceInfo(invoiceId) {
//     return await this.stripe.invoices.retrieve(invoiceId, {
//       expand: ["payment_intent.payment_method"]
//     });
//   }

// }

// module.exports = StripePay;
