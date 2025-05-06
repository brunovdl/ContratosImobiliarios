Pesquisa Contratos
Pesquisa Contratos é um sistema web para busca inteligente em contratos de locação armazenados em formato PDF. Utilizando a API Gemini para processamento de linguagem natural, o sistema extrai informações de PDFs, armazena dados estruturados (como locador, locatário e RG) e permite pesquisas em linguagem natural, como "Qual o valor do aluguel do contrato do João?". A interface web é simples e intuitiva, inspirada no estilo de busca do Google.
Funcionalidades

Extração de Texto de PDFs: Lê arquivos PDF da pasta pdfs/ e extrai texto completo usando a biblioteca pdf-parse.
Processamento com IA: Usa a API Gemini para:
Classificar contratos em categorias e subcategorias.
Gerar observações inteligentes sobre o conteúdo.
Criar embeddings para busca vetorial.
Interpretar queries em linguagem natural (ex.: "valor do aluguel do João").

Dados Estruturados: Extrai informações como nome, RG e CNPJ de locadores e locatários usando expressões regulares.
Busca Vetorial: Encontra documentos relevantes com base em similaridade de embeddings, retornando os mais próximos da query.
Interface Web: Interface amigável com Bootstrap, permitindo buscas e exibição de resultados com detalhes de locador e locatário.
Linguagem Natural: Reformula queries do usuário (ex.: "inquilino" em vez de "locatário") para melhorar a usabilidade.

Tecnologias

Backend: Node.js, Express, TypeScript
Processamento de PDFs: pdf-parse
IA e NLP: Google Gemini API
Frontend: HTML, Bootstrap, JavaScript
Outras Dependências: axios (requisições HTTP), fs (sistema de arquivos)

Estrutura do Projeto
Pesquisa_contratos/
├── src/
│   ├── scanner.ts        # Extrai texto de PDFs
│   ├── geminiClient.ts   # Integração com a API Gemini
│   ├── vectorStore.ts    # Armazena documentos e embeddings
│   ├── rag.ts            # Pipeline RAG para busca
│   ├── server.ts         # Servidor Express
├── public/
│   ├── index.html        # Interface web
│   ├── style.css         # Estilos personalizados
├── pdfs/                 # Pasta para arquivos PDF
├── documents.json        # Dados processados (gerado automaticamente)
├── package.json          # Dependências e scripts
├── tsconfig.json         # Configurações do TypeScript
├── README.md             # Documentação do projeto

Pré-requisitos

Node.js (v16 ou superior)
npm (v8 ou superior)
Chave da API Gemini:
Crie uma conta no Google Cloud Console.
Ative a API Gemini e gere uma chave em APIs & Services > Credentials.

PDFs de Contratos:
Coloque os arquivos PDF na pasta pdfs/.

Instalação

Clone o Repositório:
git clone https://github.com/seu-usuario/pesquisa_contratos.git
cd pesquisa_contratos

Instale as Dependências:
npm install

Configure a Chave da API Gemini:

Abra src/geminiClient.ts e substitua o valor de GEMINI_API_KEY pela sua chave:const GEMINI_API_KEY = 'sua-chave-aqui';

Adicione PDFs:

Coloque os arquivos PDF dos contratos na pasta pdfs/.
Exemplo de estrutura:pdfs/
├── contrato1.pdf
├── contrato2.pdf

Compile e Execute:
npm run dev

O servidor será iniciado em http://localhost:3000.

Uso

Acesse a Interface:

Abra http://localhost:3000 no navegador.

Faça uma Busca:

Digite uma query em linguagem natural, como:
"Qual o valor do aluguel do contrato do João"
"Quem é o inquilino do contrato 1"
"Quanto é o aluguel da Maria"

O sistema retorna uma resposta clara e exibe os documentos relevantes com detalhes do locador e locatário.

Resultados:

Resposta: Texto em linguagem acessível (ex.: "O aluguel do contrato de João é R$ 2.000 por mês").
Documentos Relevantes: Lista de PDFs com nome, locador (nome, CNPJ, RG) e locatário (nome, RG).

Scripts Disponíveis

Desenvolvimento:npm run dev

Executa o servidor com ts-node para desenvolvimento.

Configuração Avançada
tsconfig.json
O projeto usa TypeScript com as seguintes configurações principais:

"target": "ES2020"
"module": "commonjs"
"strict": true
"outDir": "./dist"

Limites da API Gemini

O plano gratuito da API Gemini tem limites de requisições (ex.: 60 por minuto, 1.500 por dia). Para evitar erros 429 (Too Many Requests):
O sistema processa PDFs em lotes de 2 com pausas de 5 segundos.
Retries automáticos estão implementados em geminiClient.ts.
Considere um plano pago para projetos com muitos PDFs (Google AI Pricing).

Personalização

Extração de Dados:
Ajuste as expressões regulares em vectorStore.ts para formatos específicos de contratos:const locadorMatch = pdf.text.match(/LOCADOR:\s*([^,]+),\s*pessoa\s*jurídica.*CNPJ\s*sob\s*o\s*nº\s*([\d./-]+).*RG\s*nº\s*([\d.-]+)/i);
const locatarioMatch = pdf.text.match(/LOCATÁRIO:\s*([^,]+).*RG\s*nº\s*([\d.-]+)/i);

Para extrair o valor do aluguel, adicione uma regex como:const valorMatch = pdf.text.match(/valor\s*do\s*aluguel\s*[:]?[\s]*R\$\s*([\d.,]+)/i);

Idioma: Modifique os prompts em geminiClient.ts para outros idiomas ou estilos de resposta.

Resolução de Problemas

Erro 429 (Too Many Requests):
Aguarde o reset do limite da API (1 minuto ou 24 horas).
Gere uma nova chave API no Google Cloud Console.


PDFs Não Processados:
Verifique se os PDFs estão na pasta pdfs/.
Delete documents.json para reprocessar os PDFs.


Busca Não Retorna Resultados:
Confirme que documents.json contém dados de locador e locatário.
Teste com queries específicas (ex.: RG do locatário).
Compartilhe trechos do PDF para ajustar a extração.


Erros de Compilação:
Execute npm install para garantir que todas as dependências estão instaladas.
Verifique o tsconfig.json e a versão do Node.js.