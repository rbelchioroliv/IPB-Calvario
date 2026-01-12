// constants/churchData.ts
export const AVISOS = [
  { id: 1, titulo: 'Culto de Santa Ceia', data: 'Domingo, 19:00', descricao: 'Não perca nosso culto solene de comunhão.' },
  { id: 2, titulo: 'Reunião de Jovens', data: 'Sábado, 19:30', descricao: 'Estudo sobre Romanos e comunhão.' },
];

export const HINARIO = [
  { id: 1, numero: '001', titulo: 'Santo! Santo! Santo!', letra: 'Santo! Santo! Santo! Deus onipotente!...' },
  { id: 2, numero: '026', titulo: 'Ao Deus de Abraão Louvai', letra: 'Ao Deus de Abraão louvai, do vasto céu Senhor...' },
  { id: 3, numero: '154', titulo: 'O Deus Fiel', letra: 'Tu és fiel, Senhor, meu Pai celeste...' },
];

export const VERSICULO_DO_DIA = {
  texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
  ref: "João 3:16"
};


export const INSTAGRAM_POSTS = [
  { id: 1, img: require('@/assets/images/img1.png'), caption: 'Calvário 30 anos! 🙏 #IPBCalvario #Culto' },
  { id: 2, img: require('@/assets/images/img2.png'), caption: 'Santa Ceia! 🔥' },
  { id: 3, img: require('@/assets/images/img3.png'), caption: 'Reunião de oração! #Culto 🤲' },
];

export const EVENTOS_CALENDARIO = [
  // --- JANEIRO 2026 ---
  { id: '1', data: '2026-01-04', titulo: 'Culto de Santa Ceia', hora: '19:00', tipo: 'Culto Solene' },
  { id: '2', data: '2026-01-10', titulo: 'Planejamento de Liderança', hora: '14:00', tipo: 'Reunião' },
  { id: '3', data: '2026-01-17', titulo: 'EBF - Escola Bíblica de Férias', hora: '13:30', tipo: 'Infantil' },
  { id: '4', data: '2026-01-25', titulo: 'Culto de Missões', hora: '19:00', tipo: 'Culto' },

  // --- FEVEREIRO 2026 ---
  { id: '5', data: '2026-02-01', titulo: 'Culto de Santa Ceia', hora: '19:00', tipo: 'Culto Solene' },
  { id: '6', data: '2026-02-15', titulo: 'Acampamento de Jovens', hora: '08:00', tipo: 'Jovens' },
  { id: '7', data: '2026-02-16', titulo: 'Culto de Encerramento (Acamp)', hora: '19:00', tipo: 'Culto' },
  { id: '8', data: '2026-02-20', titulo: 'Vigília de Oração', hora: '22:00', tipo: 'Oração' },

  // --- MARÇO 2026 ---
  { id: '9', data: '2026-03-01', titulo: 'Culto de Santa Ceia', hora: '19:00', tipo: 'Culto Solene' },
  { id: '10', data: '2026-03-08', titulo: 'Chá da SAF (Mulheres)', hora: '16:00', tipo: 'Mulheres' },
  { id: '11', data: '2026-03-15', titulo: 'Assembleia Ordinária', hora: '09:00', tipo: 'Reunião' },
  { id: '12', data: '2026-03-29', titulo: 'Almoço de Comunhão', hora: '12:00', tipo: 'Social' },

  // --- ABRIL 2026 ---
  { id: '13', data: '2026-04-03', titulo: 'Culto de Sexta-Feira Santa', hora: '20:00', tipo: 'Especial' },
  { id: '14', data: '2026-04-05', titulo: 'Cantata de Páscoa', hora: '19:00', tipo: 'Especial' },
  { id: '15', data: '2026-04-18', titulo: 'Reunião da UPH (Homens)', hora: '19:30', tipo: 'Homens' },
  { id: '16', data: '2026-04-26', titulo: 'Aniversário do Coral', hora: '19:00', tipo: 'Música' },
];

export const ANIVERSARIANTES = [
  { id: 1, nome: 'Maria Silva', dia: 5, mes: 1 }, 
  { id: 2, nome: 'Lucas Pereira', dia: 12, mes: 1 }, 
  { id: 3, nome: 'Ana Souza', dia: 28, mes: 1 }, 
  
  { id: 4, nome: 'Pedro Santos', dia: 2, mes: 2 }, 
  { id: 5, nome: 'Juliana Costa', dia: 15, mes: 2 }, 
  
  { id: 6, nome: 'Rev. Roberto', dia: 10, mes: 3 }, 
 
];

