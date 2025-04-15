import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const Success = () => {
  const router = useRouter()
  const { session_id } = router.query
  const [fullReading, setFullReading] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!session_id) return

    const fetchSessionData = async () => {
      try {
        const res = await fetch(`/api/session-data?session_id=${session_id}`)
        const sessionData = await res.json()

        if (res.ok) {
          const { name, birthdate, email, plan } = sessionData

          const response = await fetch('/api/generate-full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, birthdate, email, plan }),
          })

          const data = await response.json()

          if (response.ok) {
            setFullReading(data.full)
            setLoading(false)

            const pdfRes = await fetch('/api/generate-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ html: data.full }),
            })

            if (!pdfRes.ok) {
              setError('Erro ao gerar o PDF.')
              return
            }

            const pdfData = await pdfRes.json() 

            const emailResponse = await fetch('/api/send-pdf-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,                  // email do usuário
                pdfUrl: pdfData.pdfUrl, // ex: "/pdfs/xyz123.pdf"
              }),
            })

            if (!emailResponse.ok) {
              setError('Erro ao enviar o e-mail com PDF.')
              return
            }

          } else {
            setError(data.error || 'Erro ao gerar a leitura completa')
            setLoading(false)
          }
        } else {
          setError(sessionData.error || 'Erro ao buscar dados da sessão')
          setLoading(false)
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor: ' + err.message)
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [session_id])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center text-white mb-6">
        Pagamento confirmado!
      </h1>

      {loading && <p className="text-white text-center">Carregando sua leitura completa...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {fullReading && (
        <div
          className="bg-white text-black rounded-2xl p-6 shadow-lg space-y-4 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: fullReading }}
        />
      )}
    </div>
  )
}

export default Success