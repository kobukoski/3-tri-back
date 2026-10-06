app.get('/', (req, res) => {
  res.json({
    mensagem: 'API de Horários de Aula',
    endpoints: {
      'GET /': 'Informações da API',
      'GET /api/aulas': 'Listar todas as aulas',
      'GET /api/aulas/:dia': 'Listar aulas por dia da semana',
      'GET /api/aulas/ordenado/:dia': 'Listar aulas ordenadas por dia',
      'POST /api/aulas': 'Cadastrar nova aula',
      'DELETE /api/aulas/:id': 'Excluir aula por ID'
    },
    exemplo: {
      cadastro: {
        metodo: 'POST',
        url: '/api/aulas',
        body: {
          nomeComponente: 'programação',
          professor: 'Professor Silva',
          dia: 'segunda',
          ordem: 3
        }
      }
    }
  });
});

// Listar aulas
app.get('/api/aulas', (req, res) => {
  try {
    const aulas = lerAulas();
    res.json(aulas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar aulas' });
  }
});

//  Listar aulas por dia da semana
app.get('/api/aulas/:dia', (req, res) => {
  try {
    const dia = req.params.dia.toLowerCase();
    const aulas = lerAulas();
    const aulasDoDia = aulas.filter(aula => aula.dia === dia);
    
    if (aulasDoDia.length === 0) {
      return res.status(404).json({ mensagem: `Nenhuma aula encontrada para ${dia}` });
    }
    
    res.json(aulasDoDia);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar aulas do dia' });
  }
});

// Listar aulas ordenadas por dia e ordem
app.get('/api/aulas/ordenado/:dia', (req, res) => {
  try {
    const dia = req.params.dia.toLowerCase();
    const aulas = lerAulas();
    const aulasDoDia = aulas
      .filter(aula => aula.dia === dia)
      .sort((a, b) => a.ordem - b.ordem);
    
    if (aulasDoDia.length === 0) {
      return res.status(404).json({ mensagem: `Nenhuma aula encontrada para ${dia}` });
    }
    
    res.json(aulasDoDia);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar aulas ordenadas' });
  }
});

// Cadastrar nova aula
app.post('/api/aulas', (req, res) => {
  try {
    const { nomeComponente, professor, dia, ordem } = req.body;

    
    if (!nomeComponente || !professor || !dia || !ordem) {
      return res.status(400).json({ 
        erro: 'Todos os campos são obrigatórios: nomeComponente, professor, dia, ordem' 
      });
    }

    
    const diaLower = dia.toLowerCase();
    const diasValidos = ['segunda', 'terça', 'quarta', 'quinta', 'sexta'];
    if (!diasValidos.includes(diaLower)) {
      return res.status(400).json({ 
        erro: 'Dia inválido. Use: segunda, terça, quarta, quinta ou sexta' 
      });
    }

    
    if (ordem < 1 || ordem > 6) {
      return res.status(400).json({ 
        erro: 'Ordem inválida. Deve ser entre 1 e 6' 
      });
    }

    const aulas = lerAulas();

    // Verificar se já existe aula na mesma ordem do mesmo dia
    const aulaExistente = aulas.find(a => 
      a.dia === diaLower && a.ordem === ordem
    );

    if (aulaExistente) {
      return res.status(400).json({ 
        erro: `Já existe uma aula na ${ordem}ª ordem para ${diaLower}`,
        aulaExistente: aulaExistente
      });
    }

    // Incrementar ID e salvar
    global.ultimoId += 1;
    const novoId = global.ultimoId;
    salvarUltimoId(novoId);

    // Criar nova aula
    const novaAula = {
      id: novoId,
      nomeComponente,
      professor,
      dia: diaLower,
      ordem
    };

    // Adicionar à lista
    aulas.push(novaAula);
    escreverAulas(aulas);

    res.status(201).json({
      mensagem: 'Aula cadastrada com sucesso',
      aula: novaAula,
      totalAulas: aulas.length
    });

  } catch (error) {
    console.error('Erro ao cadastrar aula:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar aula' });
  }
});

// DELETE - Excluir aula por ID
app.delete('/api/aulas/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    let aulas = lerAulas();
    const index = aulas.findIndex(aula => aula.id === id);

    if (index === -1) {
      return res.status(404).json({ erro: 'Aula não encontrada' });
    }

    const aulaRemovida = aulas[index];
    aulas.splice(index, 1);
    escreverAulas(aulas);

    res.json({
      mensagem: 'Aula removida com sucesso',
      aula: aulaRemovida,
      totalAulas: aulas.length
    });

  } catch (error) {
    console.error('Erro ao excluir aula:', error);
    res.status(500).json({ erro: 'Erro ao excluir aula' });
  }
});



app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(` Servidor rodando na porta ${PORT}`);
  console.log(` Último ID: ${global.ultimoId}`);
  console.log(`Aulas cadastradas: ${lerAulas().length}`);
  console.log('========================================');
  console.log('\n Endpoints disponíveis:');
  console.log(`  GET  /`);
  console.log(`  GET  /api/aulas`);
  console.log(`  GET  /api/aulas/:dia`);
  console.log(`  GET  /api/aulas/ordenado/:dia`);
  console.log(`  POST /api/aulas`);
  console.log(`  DELETE /api/aulas/:id`);
  console.log('\n Acesse: http://localhost:3000');
  console.log('========================================\n');
});
