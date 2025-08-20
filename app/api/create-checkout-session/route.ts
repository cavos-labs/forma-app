import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { plan, gymId } = await request.json();

    if (!plan || !gymId) {
      return NextResponse.json(
        { error: 'Plan and gymId are required' },
        { status: 400 }
      );
    }

    // Define pricing
    const prices = {
      monthly: {
        amount: 2750000, // ₡27,500 in cents (Costa Rican Colón)
        currency: 'crc',
        interval: 'month',
      },
      yearly: {
        amount: 33000000, // ₡330,000 in cents
        currency: 'crc',
        interval: 'year',
      },
    };

    const priceData = prices[plan as keyof typeof prices];
    if (!priceData) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: priceData.currency,
            product_data: {
              name: `Forma Gym Management - ${plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
              description: `Complete gym management system with automated payments and analytics`,
              images: ['https://formacr.com/images/forma-logo-black.png'],
            },
            unit_amount: priceData.amount,
            recurring: {
              interval: priceData.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}&gym_id=${gymId}`,
      cancel_url: `${request.headers.get('origin')}/pricing`,
      metadata: {
        gymId: gymId,
        plan: plan,
      },
      customer_email: undefined, // Will be filled by user during checkout
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_collection: 'always',
      subscription_data: {
        metadata: {
          gymId: gymId,
          plan: plan,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}