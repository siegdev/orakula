import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import chromium from "chrome-aws-lambda";

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
  throw new Error("AWS credentials or region are not defined in environment variables.");
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { html, session_id } = req.body;

  if (!html || !session_id) {
    return res.status(400).json({ error: 'HTML e sessionId são obrigatórios.' });
  }

  try {
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'a4' });

    await browser.close();

    const pdfKey = `leituras/${session_id}.pdf`; 

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: pdfKey,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ACL: 'public-read',
      },
    });

    await upload.done();

    const pdfUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${pdfKey}`;

    return res.status(200).json({ pdfUrl });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return res.status(500).json({ error: 'Erro ao gerar o PDF.' });
  }
}