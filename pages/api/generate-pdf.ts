import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PDFDocument, StandardFonts } from 'pdf-lib';

if (!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || !process.env.NEXT_PUBLIC_AWS_REGION) {
  throw new Error("AWS credentials or region are not defined in environment variables.");
}

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { html, session_id } = req.body;

  if (!html || !session_id) {
    return res.status(400).json({ error: 'HTML e sessionId são obrigatórios.' });
  }

  try {
    // Criação do PDF usando pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    // Defina a fonte que será usada no PDF
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    
    // Aqui, convertemos o HTML para texto simples (você pode customizar essa parte conforme o seu conteúdo HTML)
    // Em um cenário real, você teria que processar o HTML e extrair o texto ou elementos necessários
    const textContent = html.replace(/<[^>]*>/g, ''); // Simples remoção de tags HTML como exemplo
    
    // Define a posição onde o texto será inserido no PDF
    page.drawText(textContent, {
      x: 50,
      y: page.getHeight() - 50,
      font,
      size: fontSize,
    });

    // Salva o PDF gerado
    const pdfBytes = await pdfDoc.save();

    // Envia o PDF para o S3
    const pdfKey = `leituras/${session_id}.pdf`;

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
        Key: pdfKey,
        Body: pdfBytes,
        ContentType: 'application/pdf',
        ACL: 'public-read',
      },
    });

    await upload.done();

    // Cria a URL pública do PDF
    const pdfUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${pdfKey}`;

    // Retorna a URL do PDF gerado
    return res.status(200).json({ pdfUrl });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return res.status(500).json({ error: 'Erro ao gerar o PDF.' });
  }
}