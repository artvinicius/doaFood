// Dados simulados — substituir pelas chamadas de API reais
// GET /api/doadores | /api/receptores | /api/ongs

export const doadores = [
  {
    id: '1', nome: 'Supermercado Bom Preço', icone: '🛒',
    cidade: 'São Paulo', estado: 'SP',
    descricao: 'Doamos produtos próximos ao vencimento e hortifrútis excedentes toda terça e quinta.',
    tags: ['Hortifrúti', 'Laticínios', 'Pães'],
    telefone: '(11) 99000-1111', email: 'doacao@bompreco.com.br',
    endereco: 'Av. Paulista, 1500 — Bela Vista',
    horario: 'Ter e Qui — 18h às 20h',
  },
  {
    id: '2', nome: 'Padaria Pão & Vida', icone: '🍞',
    cidade: 'Guarulhos', estado: 'SP',
    descricao: 'Doação de pães e bolos não vendidos ao final do dia.',
    tags: ['Pães', 'Bolos', 'Salgados'],
    telefone: '(11) 98111-2222', email: 'contato@paoevidabakery.com',
    endereco: 'R. das Flores, 234 — Centro',
    horario: 'Diário — 19h30',
  },
  {
    id: '3', nome: 'Restaurante Sabor do Bem', icone: '🍽️',
    cidade: 'São Paulo', estado: 'SP',
    descricao: 'Marmitas excedentes do almoço corporativo disponíveis para retirada.',
    tags: ['Refeições', 'Marmitas'],
    telefone: '(11) 97222-3333', email: 'rh@saboredobem.com',
    endereco: 'Rua Augusta, 900 — Consolação',
    horario: 'Seg a Sex — 14h às 15h',
  },
  {
    id: '4', nome: 'Horta Comunitária Raízes', icone: '🥦',
    cidade: 'São Bernardo do Campo', estado: 'SP',
    descricao: 'Legumes e verduras orgânicas produzidas pela comunidade.',
    tags: ['Orgânicos', 'Hortifrúti'],
    telefone: '(11) 96333-4444', email: 'horta@raizescomunitaria.org',
    endereco: 'Praça da Cidadania, s/n',
    horario: 'Sáb — 7h às 11h',
  },
];

export const receptores = [
  {
    id: '1', nome: 'Família Souza', icone: '👨‍👩‍👧‍👦',
    cidade: 'São Paulo', estado: 'SP',
    descricao: 'Família com 4 membros em situação de vulnerabilidade. Necesssitamos de alimentos não perecíveis.',
    tags: ['Não perecíveis', 'Leite', 'Óleo'],
    telefone: '(11) 95444-5555', email: '',
    endereco: 'R. Esperança, 12 — Capão Redondo',
    horario: 'Qualquer horário com aviso',
  },
  {
    id: '2', nome: 'Comunidade Vila Nova', icone: '🏘️',
    cidade: 'Diadema', estado: 'SP',
    descricao: 'Comunidade de 60 famílias que perderam renda durante enchentes recentes.',
    tags: ['Cestas básicas', 'Água', 'Higiene'],
    telefone: '(11) 94555-6666', email: 'vilanoverecebe@gmail.com',
    endereco: 'Av. Piraporinha, 300',
    horario: 'Seg a Sáb — 8h às 17h',
  },
  {
    id: '3', nome: 'Idoso Benedito Lima', icone: '👴',
    cidade: 'Mauá', estado: 'SP',
    descricao: 'Idoso de 78 anos, mora sozinho, pensão mínima. Precisa de apoio alimentar semanal.',
    tags: ['Frutas', 'Sopas', 'Laticínios'],
    telefone: '(11) 93666-7777', email: '',
    endereco: 'R. das Acácias, 45 — Jd. Zaíra',
    horario: 'Qualquer horário',
  },
];

export const ongs = [
  {
    id: '1', nome: 'Instituto Prato Cheio', icone: '🏛️',
    cidade: 'São Paulo', estado: 'SP',
    descricao: 'Combatemos o desperdício e distribuímos alimentos para mais de 500 famílias mensalmente.',
    tags: ['Distribuição', 'Educação Alimentar'],
    telefone: '(11) 3200-1000', email: 'contato@pratocheio.org.br',
    endereco: 'Av. Liberdade, 1200 — Liberdade',
    horario: 'Seg a Sex — 8h às 17h',
    cnpj: '12.345.678/0001-90',
  },
  {
    id: '2', nome: 'Rede Mesa Solidária', icone: '🤝',
    cidade: 'Santo André', estado: 'SP',
    descricao: 'Rede de 30 pontos de coleta na região do ABC. Conectamos doadores locais a receptores.',
    tags: ['Rede', 'ABC Paulista', 'Pontos de Coleta'],
    telefone: '(11) 4400-2000', email: 'rede@mesasolidaria.org',
    endereco: 'R. Coronel Oliveira Lima, 400 — Centro',
    horario: 'Seg a Sáb — 7h às 19h',
    cnpj: '98.765.432/0001-10',
  },
  {
    id: '3', nome: 'ONG Semear Esperança', icone: '🌱',
    cidade: 'Osasco', estado: 'SP',
    descricao: 'Focada em crianças e adolescentes em situação de insegurança alimentar.',
    tags: ['Crianças', 'Merenda', 'Nutrição'],
    telefone: '(11) 3600-3000', email: 'esperanca@semear.org',
    endereco: 'Rua Cel. Nogueira Padilha, 100',
    horario: 'Ter a Sáb — 9h às 16h',
    cnpj: '11.222.333/0001-44',
  },
];
