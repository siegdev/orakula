import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

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
  if (req.method !== 'GET') return res.status(405).end();

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'sessionId é obrigatório.' });
  }

  const pdfKey = `leituras/${session_id}.pdf`;

  try {
    await s3.send(new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: pdfKey,
    }));

    const pdfUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;
    return res.status(200).json({ exists: true, pdfUrl });

  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).name === 'NotFound' || (error as any).$metadata?.httpStatusCode === 404) {
      return res.status(200).json({ exists: false });
    }
    console.error('Erro inesperado ao verificar PDF no S3:', error);
    return res.status(500).json({ error: 'Erro inesperado ao verificar o PDF.' });
  }
}