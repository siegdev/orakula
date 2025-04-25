import nodemailer from 'nodemailer'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'

interface RequestBody {
  email: string
  pdfUrl: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, pdfUrl }: RequestBody = req.body

  if (!email || !pdfUrl) {
    return res.status(400).json({ error: 'Email e PDF são obrigatórios.' })
  }

  const pdfPath = path.join(process.cwd(), 'public', pdfUrl)

  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.NEXT_PUBLIC_SMTP_USER,
      pass: process.env.NEXT_PUBLIC_SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: '"Orákula" <orakula@whdev.com.br>',
      to: email,
      subject: '🔮 Sua Leitura Completa do Orákula',
      text: 'Sua leitura completa está em anexo.',
      attachments: [
        {
          filename: 'leitura.pdf',
          path: pdfPath,
        },
      ],
    })

    return res.status(200).json({ ok: true })
  } catch (error: unknown) {
    console.error('Erro ao enviar e-mail:', error)
    return res.status(500).json({ error: 'Erro ao enviar o e-mail.' })
  }
}