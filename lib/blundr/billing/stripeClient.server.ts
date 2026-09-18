import Stripe from "stripe";

import type { BillingConfig } from "./billingConfig";

export function createStripeClient(config: BillingConfig): Stripe {
  return new Stripe(config.stripeSecretKey);
}
