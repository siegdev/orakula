import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function Home() {
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [faqOpen, setFaqOpen] = useState(null)
  const [email, setEmail] = useState('')
  const [clientReviews, setClientReviews] = useState([
    {
      name: 'João Silva',
      review: 'A experiência foi incrível! A previsão estava super precisa, recomendo muito!',
      avatar: '/joao.jpeg',
    },
    {
      name: 'Maria Oliveira',
      review: 'Gostei da leitura, me ajudou a entender melhor algumas decisões importantes.',
      avatar: '/maria.jpeg',
    },
    {
      name: 'Carla Moreno',
      review: 'Excelente! Achei muito divertido e interessante.',
      avatar: '/carla.jpeg',
    },
  ])

  const router = useRouter()

  const handleSubmit = async () => {
    if (!selectedPlan) {
      alert("Por favor, selecione um plano antes de continuar.");
      return;
    }
    setLoading(true)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, birthdate, plan: selectedPlan, email })
    })
    const data = await res.json()
    setPreview(data.randomPreview)
    setLoading(false)
  }

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan)
  }

  const toggleFaq = (index: any) => {
    setFaqOpen(faqOpen === index ? null : index)
  }

  const handlePayment = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, birthdate, plan: selectedPlan, email })
    })
    const data = await res.json()
    router.push(data.url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex flex-col items-center justify-start p-4">
      {/* Header */}
      <div className="w-full max-w-3xl text-center ">
        <Image
          src="/orakula.png"
          alt="Orákula"
          width={300}
          height={300}
          className="mx-auto"
        />
        <p className="mt-1 text-lg text-white/80">Descubra os segredos do seu destino com a maior mística da internet</p>
      </div>

      {/* Input de Previsão */}
      <Card className="w-full max-w-md mt-10 text-white bg-white/10 backdrop-blur border-white/20">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Seu destino aguarda</h2>
          <Input
            placeholder="Seu primeiro nome"
            className="mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || preview}
          />
          <Input
            placeholder="Seu e-mail para envio da leitura"
            className="mb-4"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || preview}
          />
          <Input
            placeholder="Sua data de nascimento"
            className="mb-4"
            type="date"
            min="1900-01-01"
            max={new Date().toISOString().split('T')[0]}
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            disabled={loading || preview}
          />

          {/* Seleção do Plano */}
          <div className="mb-4 text-center">
            <h3 className="text-xl font-bold text-white">Escolha seu plano místico</h3>
            <div className="flex justify-center gap-4 mt-2">
              <Button className={`w-1/3 ${selectedPlan === 'basic' ? 'bg-indigo-600' : 'bg-gray-600'}`} onClick={() => handlePlanSelect('basic')}>Essencial</Button>
              <Button className={`w-1/3 ${selectedPlan === 'intermediate' ? 'bg-indigo-600' : 'bg-gray-600'}`} onClick={() => handlePlanSelect('intermediate')}>Extraordinário</Button>
              <Button className={`w-1/3 ${selectedPlan === 'advanced' ? 'bg-indigo-600' : 'bg-gray-600'}`} onClick={() => handlePlanSelect('advanced')}>Supremo</Button>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={loading || !selectedPlan || !name || !birthdate || !email}>
            {loading ? <Loader2 className="animate-spin" /> : '🔮 Revelar previsão'}
          </Button>

          {preview && (
            <div className="mt-6">
              <p className="text-sm italic text-white/80">Aqui está um vislumbre do seu futuro:</p>
              <p className="my-3 text-white">{preview}</p>
              <Button className="w-full mt-2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold hover:brightness-110 transition-all" onClick={handlePayment}>
                🔓 Liberar leitura completa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="w-full max-w-3xl mt-20 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-6">Escolha seu plano e mergulhe no desconhecido</h2>

        {/* Usando grid para garantir o alinhamento dos planos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* Plano Místico Essencial */}
          <Card className={`bg-white/10 backdrop-blur p-6 text-center flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:shadow-purple-100 ${selectedPlan === 'basic' ? 'shadow-xl shadow-purple-100' : ''}`}>
            <h3 className="text-xl font-semibold text-white">Místico <br/>Essencial</h3>
            <p className="text-white/80 mt-2">Uma previsão única e poderosa para dar o primeiro passo no seu destino</p>
            <p className="text-white/80 mt-2">🌟 Números da sorte</p>
            <p className="text-2xl text-white mt-4">R$ 9,90</p>
          </Card>

          {/* Plano Místico Extraordinário (com sombra permanente) */}
          <Card className={`bg-white/10 backdrop-blur p-6 text-center flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:shadow-purple-300 ${selectedPlan === 'intermediate' ? 'shadow-xl shadow-purple-300' : ''}`}>
            <h3 className="text-xl font-semibold text-white">Místico Extraordinário</h3>
            
            {/* Texto destacando o melhor custo-benefício */}
            <div className="mt-2">
              <span className="bg-yellow-500 text-black py-1 px-3 rounded-full text-sm font-semibold">Melhor Custo Benefício</span>
            </div>
            
            <p className="text-white/80 mt-2">Previsão completa, com cores e números da sorte, além da sorte do dia!</p>
            <p className="text-white/80 mt-2">🌟 Números da sorte</p>
            <p className="text-white/80 mt-2">🎨 Cor da sorte</p>
            <p className="text-2xl text-white mt-4">R$ 19,90</p>
          </Card>

          {/* Plano Supremo */}
          <Card className={`bg-white/10 backdrop-blur p-6 text-center flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:shadow-purple-500 ${selectedPlan === 'advanced' ? 'shadow-xl shadow-purple-500' : ''}`}>
            <h3 className="text-xl font-semibold text-white">Místico <br /> Supremo</h3>
            <p className="text-white/80 mt-2">Para aqueles que buscam uma visão profunda do futuro</p>
            <p className="text-white/80 mt-2">🌟 Números da sorte</p>
            <p className="text-white/80 mt-2">🎨 Cor da sorte</p>
            <p className="text-white/80 mt-2">🔮 Sorte do dia e previsões personalizadas</p>
            <p className="text-2xl text-white mt-4">R$ 29,90</p>
          </Card>
        </div>
      </div>

      {/* FAQ - Frequente Dúvidas */}
      <div className="w-full max-w-3xl mt-10">
        <h3 className="text-3xl font-bold text-white mb-4">Perguntas Frequentes</h3>
        <div className="space-y-4">
          {['O que é o Orákula?', 'Como funciona a previsão?', 'Preciso pagar para obter a previsão?', 'Posso acessar as previsões depois?'].map((question, index) => (
            <div key={index} className="border-b border-white/20 pb-4">
              <div
                className="flex justify-between items-center cursor-pointer text-white text-lg"
                onClick={() => toggleFaq(index)}
              >
                <span>{question}</span>
                <span>{faqOpen === index ? '▲' : '▼'}</span>
              </div>
              {faqOpen === index && (
                <p className="mt-2 text-white/80">
                  {/* Coloque as respostas aqui */}
                  {index === 0 && "O Orákula oferece previsões místicas personalizadas com base no seu nome e data de nascimento."}
                  {index === 1 && "A previsão é gerada usando inteligência artificial, baseando-se em elementos astrológicos e numerológicos."}
                  {index === 2 && "Você pode experimentar uma previsão básica gratuitamente, mas para uma leitura completa, é necessário pagar."}
                  {index === 3 && "Sim! As previsões ficam disponíveis para você durante toda a sessão."}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

           {/* Seção de Avaliações */}
      <div className="w-full max-w-3xl mt-20">
        <h2 className="text-3xl font-extrabold text-white mb-6">O que nossos usuários dizem</h2>
        <div className="space-y-4">
          {clientReviews.map((review, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur p-4 flex flex-row gap-8 items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shrink-10 object-cover overflow-hidden objetct-fit overflow-hidden">
                <Image
                  src={review.avatar}
                  alt={`Avatar de ${review.name}`}
                  width={80}
                  height={80}
                  className="rounded-full object-bottom"
                />
              </div>
              <div>
                <p className="text-white font-semibold">{review.name}</p>
                <p className="text-white/80 italic">{review.review}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full mt-20 py-6 bg-black/60 text-center">
        <small className="text-white text-sm">
          O Orákula é um serviço de entretenimento e não deve ser considerado como aconselhamento profissional.
          As previsões são geradas com base em algoritmos e não têm valor científico.
          Não recomendamos que você tome decisões importantes com base nas previsões.
        </small>
      </div>

    </div>
  )
}
