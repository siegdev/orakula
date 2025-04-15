import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {
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
    const pdfPath = path.join('/tmp', filename)
    

    // Garante que o diretório exista
    fs.mkdirSync(path.dirname(pdfPath), { recursive: true })
    fs.writeFileSync(pdfPath, pdfBuffer)

    // Retorna a URL do PDF
    return res.status(200).json({ pdfUrl: `/pdfs/${pdfName}` })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return res.status(500).json({ error: 'Erro ao gerar PDF.' })
  }
}