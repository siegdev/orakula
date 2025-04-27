import { secret } from '@aws-amplify/backend'
import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, pdfUrl, fullReading } = req.body

  if (!email || !pdfUrl || !fullReading) {
    return res.status(400).json({ error: 'Email, PDF e leitura são obrigatórios.' })
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    auth: {
      user: secret('SMTP_USER') as unknown as string,
      pass: secret('SMTP_PASS') as unknown as string,
    },
  })

  try {
    const mailOptions = {
      from: '"Orákula" <orakula@whdev.com.br>',
      to: email,
      subject: '🔮 Sua Leitura Completa do Orákula',
      html: `
        <h2>Sua Leitura Completa do Orákula 🔮</h2>
        <p>Olá! Sua leitura completa está abaixo:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p>${fullReading}</p>
        </div>
        <p style="margin-top: 20px;">Para acessar sua leitura completa posteriormente, clique no link abaixo:</p>
        <p><a href="${pdfUrl}" target="_blank" style="color: #4e73df; text-decoration: none; font-weight: bold;">Acessar Leitura Completa</a></p>
        <p style="margin-top: 20px;">Atenciosamente,<br />Equipe Orákula</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    return res.status(500).json({ error: 'Erro ao enviar o e-mail.' })
  }
}
