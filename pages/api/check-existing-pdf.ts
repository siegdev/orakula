import { S3 } from 'aws-sdk'

const s3 = new S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  accessKeyId: process.env.VAR_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.VAR_AWS_SECRET_ACCESS_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { session_id } = req.query
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' })

  const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME
  const region = process.env.NEXT_PUBLIC_AWS_REGION

  if (!bucketName || !region) {
    return res.status(500).json({ error: 'AWS S3 configuration is missing' })
  }

  try {
    const fileName = `leitura-${session_id}.pdf`
    const params = {
      Bucket: bucketName,
      Key: fileName,
    }

    // Verifica se o arquivo existe no S3
    const headData = await s3.headObject(params).promise()

    if (headData) {
      // Se o arquivo existe, retorna o link público
      const pdfUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`
      return res.status(200).json({ pdfUrl })
    }

    // Caso não exista
    return res.status(404).json({ error: 'PDF não encontrado' })
  } catch (error) {
    console.error('Erro ao verificar PDF no S3:', error)
    return res.status(500).json({ error: 'Erro ao verificar o PDF' })
  }
}
