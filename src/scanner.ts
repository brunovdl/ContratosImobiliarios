import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export interface PDFData {
  id: string;
  name: string;
  path: string;
  size: number;
  text: string;
}

export async function scanPDFs(directory: string): Promise<PDFData[]> {
  const pdfFiles: PDFData[] = [];
  const files = fs.readdirSync(directory);

  for (const file of files) {
    if (path.extname(file).toLowerCase() === '.pdf') {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer, { max: 0 }); // Remove limite de páginas

      pdfFiles.push({
        id: filePath,
        name: file,
        path: filePath,
        size: stats.size,
        text: data.text.replace(/\s+/g, ' ').trim(), // Normaliza espaços
      });
    }
  }
  return pdfFiles;
}