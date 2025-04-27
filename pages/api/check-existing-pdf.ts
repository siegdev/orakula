import { S3 } from 'aws-sdk'

const s3 = new S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
    console.dir('1a');
  const { session_id } = req.query
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' })
    console.dir('2b');
  const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME
  const region = process.env.NEXT_PUBLIC_AWS_REGION
  console.dir('3c');
  if (!bucketName || !region) {
    return res.status(500).json({ error: 'AWS S3 configuration is missing' })
  }
    
  // Verifica se o arquivo existe no S3
  try {
    const fileName = `leitura-${session_id}.pdf`
    const params = {
      Bucket: bucketName,
      Key: fileName,
    }

    await s3.headObject(params).promise();
    console.log('PDF já existe no S3.');

    const pdfUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`
    return res.status(200).json({ pdfUrl })
  } catch (error) {
    if ((error as any).code !== 'NotFound') {
      console.dir('aaa');
      console.error('Erro inesperado ao verificar PDF no S3:', error);
      console.dir('bbb');
      return res.status(500).json({ error: 'Erro ao verificar o PDF' })
    }
  }
}
