import axios from 'axios';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

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
    const response = await axios.post('https://api.html2pdf.app/v1/generate', 
      {
        html,
        apiKey: process.env.HTML2PDF_API_KEY,
      },
      {
        responseType: 'arraybuffer', // importante para receber os bytes do PDF
      }
    );

    const pdfBuffer = response.data;

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

    const pdfUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;

    return res.status(200).json({ pdfUrl });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return res.status(500).json({ error: 'Erro ao gerar o PDF.' });
  }
}