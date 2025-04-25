import Stripe from 'stripe'
import { NextApiRequest, NextApiResponse } from 'next'

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil',
})

interface CheckoutRequestBody {
  plan: 'basic' | 'intermediate' | 'advanced'
  name: string
  birthdate: string
  email: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { plan, name, birthdate, email }: CheckoutRequestBody = req.body
  const mode = process.env.NEXT_PUBLIC_STRIPE_MODE || 'test'

  // Define os preços com base no modo
  const priceMap: Record<string, string> = {
    basic: mode === 'live'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_LIVE as string
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_TEST as string,
    intermediate: mode === 'live'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_INTERMEDIATE_LIVE as string
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_INTERMEDIATE_TEST as string,
    advanced: mode === 'live'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVANCED_LIVE as string
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVANCED_TEST as string,
  }

  const priceId = priceMap[plan]

  if (!priceId) {
    return res.status(400).json({ error: 'Plano inválido ou não configurado' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        name,
        birthdate,
        email,
        plan,
      },
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Erro Stripe:', err)
    res.status(500).json({ error: 'Erro ao criar checkout' })
  }
}