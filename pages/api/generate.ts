import { NextApiRequest, NextApiResponse } from 'next'
import { mensagensGratuitas } from '../../utils/mensagensGratuitas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const randomIndex = Math.floor(Math.random() * mensagensGratuitas.length)
    const randomPreview = mensagensGratuitas[randomIndex]
    res.status(200).json({ randomPreview })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao gerar leitura básica' })
  }
}