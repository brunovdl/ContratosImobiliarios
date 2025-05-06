import express from 'express';
import bodyParser from 'body-parser';
import { scanPDFs } from './scanner';
import { processAndStorePDFs, loadDocuments, hasDocuments } from './vectorStore';
import { processQuery } from './rag';
import { Document } from './vectorStore';

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Inicializa os documentos ao iniciar o servidor
(async () => {
  loadDocuments();
  if (!hasDocuments()) {
    const pdfs = await scanPDFs('./pdfs');
    await processAndStorePDFs(pdfs);
  }
})();

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  const { answer, relevantDocs } = await processQuery(question);
  const loadedDocuments = loadDocuments();
  const locadores = relevantDocs.map(name => {
    const doc = loadedDocuments.find((d: Document) => d.name === name);
    return doc?.locador || null;
  });
  const locatarios = relevantDocs.map(name => {
    const doc = loadedDocuments.find((d: Document) => d.name === name);
    return doc?.locatario || null;
  });
  res.json({ answer, relevantDocs, locadores, locatarios });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});