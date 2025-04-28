import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const Success = () => {
  const router = useRouter()
  const { session_id } = router.query
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previousReading] = useState<string | null>(null)

  useEffect(() => {
    if (!session_id) return

    const fetchSessionData = async () => {
      try {
        const res = await fetch(`/api/session-data?session_id=${session_id}`)
        const sessionData = await res.json()

        if (res.ok) {
          const { name, birthdate, email, plan } = sessionData

          const pdfRes = await fetch(`/api/check-existing-pdf?session_id=${session_id}`)
          const pdfData = await pdfRes.json()

          if (pdfRes.ok && pdfData.pdfUrl) {
            setPdfUrl(pdfData.pdfUrl)
            setLoading(false)
            return
          }

          const response = await fetch('/api/generate-full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, birthdate, email, plan }),
          })

          const data = await response.json()

          if (response.ok) {
            const { full } = data

            const pdfRes = await fetch('/api/generate-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ html: full, session_id }),
            })

            if (!pdfRes.ok) {
              setError('Erro ao gerar o PDF.')
              return
            }

            const pdfData = await pdfRes.json()

            // Atualiza o estado com o link para o PDF
            setPdfUrl(pdfData.pdfUrl)

            // Envia o email com o PDF
            const emailResponse = await fetch('/api/send-pdf-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                pdfUrl: pdfData.pdfUrl,
                fullReading: full,
              }),
            })

            if (!emailResponse.ok) {
              setError('Erro ao enviar o e-mail com PDF.')
              return
            }

            setLoading(false)
          } else {
            setError(data.error || 'Erro ao gerar a leitura completa')
            setLoading(false)
          }
        } else {
          setError(sessionData.error || 'Erro ao buscar dados da sessão')
          setLoading(false)
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError('Erro ao conectar com o servidor: ' + err.message)
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [session_id])

  useEffect(() => {
    if (pdfUrl) {
      router.push(`${pdfUrl}`)
    }
  }, [pdfUrl, router])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center text-white mb-6">
        Pagamento confirmado!
      </h1>

      {loading && <p className="text-white text-center">Carregando sua leitura completa...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {!loading && !error && !pdfUrl && !previousReading && (
        <p className="text-white text-center">Redirecionando você para o seu PDF...</p>
      )}

      {previousReading && (
        <div className="text-white text-center">
          <p>A leitura já foi gerada. Você pode acessá-la abaixo:</p>
          <p>
            <a href={previousReading} className="text-blue-500" target="_blank" rel="noopener noreferrer">
              Acessar leitura anterior
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

export default Success