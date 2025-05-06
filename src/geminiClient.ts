import 'dotenv/config';
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'sua-chave-aqui'; // Substitua pela sua chave
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiWithRetry(prompt: string, model: string = 'gemini-2.0-flash', retries: number = 3, delay: number = 1000): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}/models/${model}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      if (error.response?.status === 429 && attempt < retries) {
        console.warn(`Erro 429: Tentativa ${attempt}/${retries}. Aguardando ${delay}ms...`);
        await sleep(delay);
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
  throw new Error('Máximo de tentativas atingido após erro 429');
}

async function callGemini(prompt: string, model: string = 'gemini-1.5-flash'): Promise<string> {
  return callGeminiWithRetry(prompt, model);
}

export async function generateCategory(text: string): Promise<string> {
  const prompt = `Classifique o seguinte texto em uma categoria principal: ${text.slice(0, 2000)}`;
  return callGemini(prompt);
}

export async function generateSubcategory(text: string, category: string): Promise<string> {
  const prompt = `Dada a categoria "${category}", classifique o seguinte texto em uma subcategoria: ${text.slice(0, 2000)}`;
  return callGemini(prompt);
}

export async function generateObservation(text: string): Promise<string> {
  const prompt = `Faça uma observação inteligente sobre o conteúdo do seguinte texto: ${text.slice(0, 2000)}`;
  return callGemini(prompt);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}/models/embedding-001:embedContent`,
        {
          content: { parts: [{ text: text.slice(0, 2000) }] },
          taskType: 'RETRIEVAL_DOCUMENT',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
        }
      );
      return response.data.embedding.values;
    } catch (error: any) {
      if (error.response?.status === 429 && attempt < 3) {
        console.warn(`Erro 429 em embedding: Tentativa ${attempt}/3. Aguardando ${1000 * attempt}ms...`);
        await sleep(1000 * attempt);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Máximo de tentativas atingido após erro 429 em embedding');
}

export async function generateResponse(prompt: string): Promise<string> {
  const responsePrompt = `Responda à seguinte pergunta em linguagem natural, clara e acessível, evitando jargões técnicos como "locatário" ou "locador". Use termos como "inquilino" ou "proprietário" quando apropriado: ${prompt}`;
  return callGemini(responsePrompt);
}

export async function reformulateQuery(query: string): Promise<{ reformulated: string; entities: { name?: string; field?: string } }> {
  const prompt = `Analise a seguinte pergunta em linguagem natural e reformule-a para uma busca em um sistema de contratos de locação. Identifique entidades (ex.: nome de pessoa) e o campo buscado (ex.: valor do aluguel). Retorne APENAS o JSON puro, sem marcações de Markdown como \`\`\`json ou \`\`\`. Exemplo:
  {
    "reformulated": "valor do aluguel no contrato onde João é o locatário",
    "entities": { "name": "João", "field": "valor do aluguel" }
  }
  Pergunta: ${query}`;
  try {
    const response = await callGemini(prompt);
    // Limpar possíveis marcações de Markdown
    const cleanedResponse = response.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Erro ao parsear resposta do Gemini:', error);
    // Resposta padrão em caso de falha
    return {
      reformulated: query,
      entities: {}
    };
  }
}