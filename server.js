// server.js

// --- 1. Importação das Bibliotecas ---
const express = require('express');
const { put, list, del } = require('@vercel/blob');
const dotenv = require('dotenv');
const path = require('path');

// --- 2. Configuração Inicial ---
dotenv.config();
const app = express();

// Middleware para parsing de JSON
app.use(express.json({ limit: '50mb' }));

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

// Rota para DELETAR arquivo (método DELETE)
app.delete('/api/delete', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL do arquivo é obrigatória.' });
    }

    await del(url);
    res.status(200).json({ success: true, message: 'Arquivo deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ success: false, message: 'Erro ao deletar arquivo.', error: error.message });
  }
});

// Rota para ATUALIZAR arquivo (método PUT)
app.put('/api/update', async (req, res) => {
  try {
    const { oldUrl, newUrl } = req.body;
    
    if (!oldUrl || !newUrl) {
      return res.status(400).json({ message: 'URLs antiga e nova são obrigatórias.' });
    }

    // Como o Vercel Blob não permite atualização direta, apenas retornamos a nova URL
    // Em um sistema real, você teria um banco de dados para gerenciar as referências
    res.status(200).json({ 
      success: true, 
      message: 'Referência atualizada com sucesso.',
      newUrl: newUrl
    });
  } catch (error) {
    console.error('Erro ao atualizar arquivo:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar arquivo.', error: error.message });
  }
});

// --- 4. Servindo o Frontend ---
app.use(express.static(path.join(__dirname, 'public')));

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- 5. Inicialização do Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
