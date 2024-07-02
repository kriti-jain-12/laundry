import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';

@Injectable()
export class UtilsStripeService {
  constructor(@InjectStripe() private readonly stripeClient: Stripe) {}

  async createCustomer(options: {
    name: string;
    phone?: string;
    email: string;
  }) {
    try {
      return await this.stripeClient.customers.create({
        name: options.name,
        email: options.email,
        phone: options.phone ?? '',
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getPaymentIntent(options: { payment_intent_id: string }) {
    try {
      return await this.stripeClient.setupIntents.retrieve(
        options.payment_intent_id,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getPaymentMethod(options: { payment_method_id: string }) {
    try {
      return await this.stripeClient.paymentMethods.retrieve(
        options.payment_method_id,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async setupFuturePaymentIntent(options: { customer_id: string }) {
    try {
      return await this.stripeClient.setupIntents.create({
        customer: options.customer_id,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async createPaymentIntent(options: {
    payment_method_id: string;
    amount: number;
    customer_id: string;
  }) {
    try {
      return await this.stripeClient.paymentIntents.create({
        amount: options.amount,
        currency: 'cad',
        customer: options.customer_id,
        payment_method: options.payment_method_id,
        automatic_payment_methods: {
          enabled: true,
        },
        off_session: true,
        confirm: true,
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
