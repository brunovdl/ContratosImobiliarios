import fs from 'fs';
import { PDFData } from './scanner';
import { generateCategory, generateSubcategory, generateObservation, generateEmbedding } from './geminiClient';

export interface Document {
  id: string;
  name: string;
  path: string;
  size: number;
  text: string;
  category: string;
  subcategory: string;
  observation: string;
  embedding: number[];
  locador?: { name: string; cnpj: string; rg: string };
  locatario?: { name: string; rg: string };
}

let documents: Document[] = [];

export async function processAndStorePDFs(pdfData: PDFData[]): Promise<void> {
  const batchSize = 2;
  for (let i = 0; i < pdfData.length; i += batchSize) {
    const batch = pdfData.slice(i, i + batchSize);
    for (const pdf of batch) {
      const category = await generateCategory(pdf.text);
      const subcategory = await generateSubcategory(pdf.text, category);
      const observation = await generateObservation(pdf.text);
      const embedding = await generateEmbedding(pdf.text);

      const locadorMatch = pdf.text.match(/LOCADOR:\s*([^,]+),\s*pessoa\s*jurídica.*CNPJ\s*sob\s*o\s*nº\s*([\d./-]+).*RG\s*nº\s*([\d.-]+)/i);
      const locatarioMatch = pdf.text.match(/LOCATÁRIO:\s*([^,]+).*RG\s*nº\s*([\d.-]+)/i);

      documents.push({
        ...pdf,
        category,
        subcategory,
        observation,
        embedding,
        locador: locadorMatch ? { name: locadorMatch[1].trim(), cnpj: locadorMatch[2], rg: locadorMatch[3] } : undefined,
        locatario: locatarioMatch ? { name: locatarioMatch[1].trim(), rg: locatarioMatch[2] } : undefined,
      });
    }
    if (i + batchSize < pdfData.length) {
      console.log('Pausa de 5 segundos para evitar limite de taxa...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  saveDocuments();
}

export function loadDocuments(): Document[] {
  if (fs.existsSync('documents.json')) {
    const data = fs.readFileSync('documents.json', 'utf-8');
    documents = JSON.parse(data);
  }
  return documents;
}

export function hasDocuments(): boolean {
  return documents.length > 0;
}

function saveDocuments() {
  fs.writeFileSync('documents.json', JSON.stringify(documents, null, 2));
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB) || 0;
}

export function findSimilarDocuments(queryEmbedding: number[], topK: number = 3): Document[] {
  const similarities = documents.map(doc => ({
    doc,
    similarity: cosineSimilarity(queryEmbedding, doc.embedding),
  }));
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, topK).map(item => item.doc);
}