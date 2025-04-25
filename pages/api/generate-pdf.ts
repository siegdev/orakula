import puppeteer from 'puppeteer'
import { S3 } from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

const s3 = new S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()

  const { html } = req.body

  if (!html) {
    return res.status(400).json({ error: 'HTML é obrigatório.' })
  }

  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({ format: 'A4' })
    await browser.close()

    const pdfName = `leitura-${uuidv4()}.pdf`

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: `pdfs/${pdfName}`,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'public-read', 
    }

    const data = await s3.upload(params).promise()

    const pdfUrl = data.Location

    return res.status(200).json({ pdfUrl })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return res.status(500).json({ error: 'Erro ao gerar PDF.' })
  }
}