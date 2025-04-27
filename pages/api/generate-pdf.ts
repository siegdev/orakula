import puppeteer from 'puppeteer'
import { S3 } from 'aws-sdk'

const s3 = new S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  console.dir('1');
  if (req.method !== 'POST') return res.status(405).end()
    console.dir('2');
  const { html, session_id } = req.body
  console.dir('3');
  if (!html) {
    return res.status(400).json({ error: 'HTML é obrigatório.' })
  }
  console.dir('4');
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    console.dir('5');
    const pdfBuffer = await page.pdf({ format: 'A4' })
    await browser.close()
    console.dir('6');
    const pdfName = `leitura-${session_id}.pdf`
    console.dir('7');
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: `${pdfName}`,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'public-read', 
    }
    console.dir('8');
    const data = await s3.upload(params).promise()
    console.dir('9');
    const pdfUrl = data.Location
    console.dir('10');
    return res.status(200).json({ pdfUrl })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return res.status(500).json({ error: 'Erro ao gerar PDF.' })
  }
}