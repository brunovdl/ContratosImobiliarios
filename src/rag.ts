import { generateEmbedding, generateResponse, reformulateQuery } from './geminiClient';
import { findSimilarDocuments } from './vectorStore';

export async function processQuery(query: string): Promise<{ answer: string; relevantDocs: string[] }> {
  // Reformular a query para interpretar linguagem natural
  const { reformulated, entities } = await reformulateQuery(query);
  
  // Gerar embedding da query reformulada
  const queryEmbedding = await generateEmbedding(reformulated);
  
  // Encontrar documentos relevantes
  const similarDocs = findSimilarDocuments(queryEmbedding);
  
  // Construir prompt com contexto adicional
  let prompt = `Pergunta: ${reformulated}\n\nTrechos relevantes:\n${similarDocs.map(doc => doc.text.slice(0, 2000)).join('\n')}`;
  if (entities.name) {
    prompt += `\n\nContexto: A pergunta provavelmente se refere ao contrato onde ${entities.name} é o inquilino.`;
  }
  if (entities.field) {
    prompt += `\nFoquem em responder sobre o ${entities.field}.`;
  }
  
  // Gerar resposta em linguagem natural
  const answer = await generateResponse(prompt);
  
  return {
    answer,
    relevantDocs: similarDocs.map(doc => doc.name),
  };
}