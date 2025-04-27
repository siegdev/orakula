import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

interface SessionMetadata {
  name: string
  birthdate: string
  email: string
  plan: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { session_id } = req.query

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid session_id' })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)

    const { name, birthdate, email, plan } = session.metadata as unknown as SessionMetadata

    res.status(200).json({ name, birthdate, email, plan })
  } catch (err: unknown) {
    console.error('Failed to retrieve session:', err)
    res.status(500).json({ error: `Failed to retrieve session: ${err instanceof Error ? err.message : 'Unknown error'}` })
  }
}