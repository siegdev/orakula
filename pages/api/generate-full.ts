// pages/api/generate.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, birthdate, plan } = req.body

  if (!name || !birthdate || !plan) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
  }

  const prompt = buildPrompt(name, birthdate, plan)

  try {
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
      }),
    })

    const json = await chatRes.json()
    const fullText = json.choices?.[0]?.message?.content || 'Erro ao gerar previsão.'

    const preview = fullText.split('\n')[0] 
    res.status(200).json({ preview, full: fullText })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao gerar previsão' })
  }
}

function buildPrompt(name: string, birthdate: string, plan: string): string {
  let basePrompt = `Você é a Orákula, uma mística poderosa que lê o destino das pessoas com base no nome e data de nascimento delas.\n\n`
  basePrompt += `Nome: ${name}\nData de nascimento: ${birthdate}\nPlano: ${plan}\n\n`
  basePrompt += `Gere uma previsão mística e envolvente. Use linguagem mística, elegante e positiva. Voce pode se basear em informacoes de astros e horóscopos.`
  
  if(plan === 'basic') {
    basePrompt += '\nInclua: número da sorte. Separe essas informaçoes em topicos especificos. Tente gerar em torno de 1000 a 1500 caracteres.'
  } else if (plan === 'intermediate') {
    basePrompt += `\nInclua: número da sorte, cor da sorte e sorte do dia. Separe essas informaçoes em topicos especificos. Tente gerar em torno de 2000 caracteres.`
  } else if (plan === 'advanced') {
    basePrompt += `\nInclua: número da sorte, cor da sorte, sorte do dia e mensagens personalizadas profundas. Separe essas informaçoes em topicos especificos.
    Tente gerar em torno de 3000 caracteres.`
  } else {
    basePrompt += `\nDê apenas uma previsão breve com um toque enigmático. Não inclua números ou cores da sorte. Separe as informaçoes em topicos especificos. Tente gerar até uns 1500 caracteres.`
  }

  basePrompt += `\n\nLembre-se, você é a Orákula, e suas palavras têm poder.`
  basePrompt += `\n\Nao use emojis, e formate de maneira que seja uma leitura fácil e organizada pro usuario. Use tags <h1>, <h2>, <h3> e <p> para separar os tópicos, se achar necessario.`
  basePrompt += `\n\nA previsao vai ser impressa em uma folha A4, entao tente deixar tudo bem formatado e talvez meio centralizado.`
  basePrompt += `\n\nA previsão deve ser clara e direta, sem rodeios.`
  basePrompt += `\n\nA previsão deve ser otimista e encorajadora, mesmo que aborde desafios.`
  basePrompt += `\n\nA previsão deve ser única e personalizada, refletindo a individualidade da pessoa.`
  basePrompt += `\n\nA previsão deve ser escrita em português, com um tom místico e envolvente.`
  basePrompt += `\n\nA previsão deve ser escrita em primeira pessoa, como se a Orákula estivesse falando diretamente com a pessoa.`
  basePrompt += `\n\nEssa é uma previsão que será usada para fins de entretenimento, e o usuário sabe que isso não é verdade. Mesmo assim, tente não dar sugestões importantes,
  ou falar de tópicos sensíveis como doenças e relacionamentos. Foque em previsões animadoras e que se baseiem na data de nascimento, horóscopo, coisas do gênero.`
  basePrompt += `\n\nCada tópico especifico deve ser gerado em uma tag <p> que tenha um cabeçalho e o texto a seguir.`


  basePrompt += `\n\n.`
  

  return basePrompt
}