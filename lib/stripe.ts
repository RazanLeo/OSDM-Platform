import Stripe from "stripe"

// Use a dummy key during build time if not provided
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_build"

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  currency: "SAR",
  // Stripe fee structure
  platformCommission: 0.25, // 25% platform commission
  paymentGatewayFee: 0.05, // 5% gateway fee
}
