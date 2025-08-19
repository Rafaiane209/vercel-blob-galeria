// server.js

// --- 1. Importação das Bibliotecas ---
const express = require('express');
const { put, list, del, copy } = require('@vercel/blob'); // Adicionamos 'del' e 'copy'
const dotenv = require('dotenv');
const path = require('path');

// --- 2. Configuração Inicial ---
dotenv.config();
const app = express();

// Middleware para parsear JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- 3. Definição das Rotas da API ---

// Rota para UPLOAD de arquivos (método POST)
app.post('/api/upload', async (req, res) => {
  const filename = req.headers['x-vercel-filename'];

  if (!filename) {
    return res.status(400).json({ message: 'O nome do arquivo é obrigatório no cabeçalho x-vercel-filename.' });
  }

  try {
    const blob = await put(filename, req, {
      access: 'public',
    });
    res.status(200).json(blob);
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do arquivo.', error: error.message });
  }
});

// Rota para LISTAR os arquivos da galeria (método GET)
app.get('/api/files', async (req, res) => {
  try {
    const { blobs } = await list();
    res.status(200).json(blobs);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ message: 'Erro ao buscar a lista de arquivos.', error: error.message });
  }
});

// Rota para EXCLUIR arquivo (método DELETE)
app.delete('/api/file/:url', async (req, res) => {
  try {
    // Decodifica a URL do arquivo que vem como parâmetro
    const fileUrl = decodeURIComponent(req.params.url);
    await del(fileUrl);
    res.status(200).json({ message: 'Arquivo excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    res.status(500).json({ message: 'Erro ao excluir o arquivo.', error: error.message });
  }
});

// Rota para RENOMEAR arquivo (método PUT)
app.put('/api/file/rename', async (req, res) => {
  try {
    const { oldUrl, newFilename } = req.body;
    
    if (!oldUrl || !newFilename) {
      return res.status(400).json({ message: 'URL antiga e novo nome são obrigatórios.' });
    }

    // Copia o arquivo para um novo nome
    const newBlob = await copy(oldUrl, newFilename, {
      access: 'public',
    });

    // Exclui o arquivo antigo
    await del(oldUrl);

    res.status(200).json({ 
      message: 'Arquivo renomeado com sucesso!',
      newBlob 
    });
  } catch (error) {
    console.error('Erro ao renomear arquivo:', error);
    res.status(500).json({ message: 'Erro ao renomear o arquivo.', error: error.message });
  }
});

// --- 4. Servindo o Frontend ---
app.use(express.static(path.join(__dirname, 'public')));

// --- 5. Inicialização do Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
