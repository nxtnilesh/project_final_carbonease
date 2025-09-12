const stripe = require('../config/stripe');

class StripeService {
  // Create a customer
  static async createCustomer(userData) {
    try {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        metadata: {
          userId: userData.id
        }
      });
      return customer;
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  // Update customer
  static async updateCustomer(customerId, updateData) {
    try {
      const customer = await stripe.customers.update(customerId, updateData);
      return customer;
    } catch (error) {
      throw new Error(`Failed to update Stripe customer: ${error.message}`);
    }
  }

  // Create payment intent
  static async createPaymentIntent(amount, currency, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  // Retrieve payment intent
  static async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  // Create checkout session
  static async createCheckoutSession(lineItems, successUrl, cancelUrl, metadata = {}) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI'],
        },
      });
      return session;
    } catch (error) {
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  // Create refund
  static async createRefund(paymentIntentId, amount, reason = 'requested_by_customer') {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
        reason,
      });
      return refund;
    } catch (error) {
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  // Retrieve refund
  static async retrieveRefund(refundId) {
    try {
      const refund = await stripe.refunds.retrieve(refundId);
      return refund;
    } catch (error) {
      throw new Error(`Failed to retrieve refund: ${error.message}`);
    }
  }

  // List customer's payment methods
  static async listPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods;
    } catch (error) {
      throw new Error(`Failed to list payment methods: ${error.message}`);
    }
  }

  // Create setup intent for saving payment methods
  static async createSetupIntent(customerId) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
      });
      return setupIntent;
    } catch (error) {
      throw new Error(`Failed to create setup intent: ${error.message}`);
    }
  }

  // Create invoice
  static async createInvoice(customerId, items, metadata = {}) {
    try {
      const invoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: 'charge_automatically',
        metadata,
      });

      // Add line items
      for (const item of items) {
        await stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          amount: Math.round(item.amount * 100),
          currency: item.currency.toLowerCase(),
          description: item.description,
        });
      }

      return invoice;
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  // Finalize and pay invoice
  static async finalizeAndPayInvoice(invoiceId) {
    try {
      const invoice = await stripe.invoices.finalizeInvoice(invoiceId);
      const paidInvoice = await stripe.invoices.pay(invoiceId);
      return paidInvoice;
    } catch (error) {
      throw new Error(`Failed to finalize and pay invoice: ${error.message}`);
    }
  }

  // Get account balance
  static async getBalance() {
    try {
      const balance = await stripe.balance.retrieve();
      return balance;
    } catch (error) {
      throw new Error(`Failed to retrieve balance: ${error.message}`);
    }
  }

  // Create transfer to connected account
  static async createTransfer(amount, currency, destination, metadata = {}) {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        destination,
        metadata,
      });
      return transfer;
    } catch (error) {
      throw new Error(`Failed to create transfer: ${error.message}`);
    }
  }

  // Create webhook endpoint
  static async createWebhookEndpoint(url, events) {
    try {
      const endpoint = await stripe.webhookEndpoints.create({
        url,
        enabled_events: events,
      });
      return endpoint;
    } catch (error) {
      throw new Error(`Failed to create webhook endpoint: ${error.message}`);
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(payload, signature, secret) {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, secret);
      return event;
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  // Get payment method details
  static async getPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      throw new Error(`Failed to retrieve payment method: ${error.message}`);
    }
  }

  // Detach payment method
  static async detachPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      throw new Error(`Failed to detach payment method: ${error.message}`);
    }
  }

  // Create price for recurring billing
  static async createPrice(productId, unitAmount, currency, interval = null) {
    try {
      const priceData = {
        product: productId,
        unit_amount: Math.round(unitAmount * 100), // Convert to cents
        currency: currency.toLowerCase(),
      };

      if (interval) {
        priceData.recurring = { interval };
      }

      const price = await stripe.prices.create(priceData);
      return price;
    } catch (error) {
      throw new Error(`Failed to create price: ${error.message}`);
    }
  }

  // Create subscription
  static async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }
}

module.exports = StripeService;
