
export const LIVROS_BIBLIA = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
  "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis",
  "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos",
  "Provérbios", "Eclesiastes", "Cânticos", "Isaías", "Jeremias", "Lamentações",
  "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas", "Miquéias",
  "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios",
  "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses",
  "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo",
  "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
  "1 João", "2 João", "3 João", "Judas", "Apocalipse"
];

// Mapeamento de abreviações
export const ABREVIACOES: { [key: string]: string } = {
  "Gênesis": "gn", "Êxodo": "ex", "Levítico": "lv", "Números": "nm", "Deuteronômio": "dt",
  "Josué": "js", "Juízes": "jz", "Rute": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
  "1 Reis": "1rs", "2 Reis": "2rs", "1 Crônicas": "1cr", "2 Crônicas": "2cr", "Esdras": "ed",
  "Neemias": "ne", "Ester": "et", "Jó": "job", "Salmos": "sl", "Provérbios": "pv",
  "Eclesiastes": "ec", "Cânticos": "ct", "Isaías": "is", "Jeremias": "jr", "Lamentações": "lm",
  "Ezequiel": "ez", "Daniel": "dn", "Oséias": "os", "Joel": "jl", "Amós": "am",
  "Obadias": "ob", "Jonas": "jn", "Miquéias": "mq", "Naum": "na", "Habacuque": "hc",
  "Sofonias": "sf", "Ageu": "ag", "Zacarias": "zc", "Malaquias": "ml",
  "Mateus": "mt", "Marcos": "mc", "Lucas": "lc", "João": "jo", "Atos": "at",
  "Romanos": "rm", "1 Coríntios": "1co", "2 Coríntios": "2co", "Gálatas": "gl",
  "Efésios": "ef", "Filipenses": "fp", "Colossenses": "cl", "1 Tessalonicenses": "1ts",
  "2 Tessalonicenses": "2ts", "1 Timóteo": "1tm", "2 Timóteo": "2tm", "Tito": "tt",
  "Filemom": "fm", "Hebreus": "hb", "Tiago": "tg", "1 Pedro": "1pe", "2 Pedro": "2pe",
  "1 João": "1jo", "2 João": "2jo", "3 João": "3jo", "Judas": "jd", "Apocalipse": "ap"
};

// Mapeamento de capítulos
export const CAPITULOS_POR_LIVRO: { [key: string]: number } = {
  "Gênesis": 50, "Êxodo": 40, "Levítico": 27, "Números": 36, "Deuteronômio": 34,
  "Josué": 24, "Juízes": 21, "Rute": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Reis": 22, "2 Reis": 25, "1 Crônicas": 29, "2 Crônicas": 36, "Esdras": 10,
  "Neemias": 13, "Ester": 10, "Jó": 42, "Salmos": 150, "Provérbios": 31,
  "Eclesiastes": 12, "Cânticos": 8, "Isaías": 66, "Jeremias": 52, "Lamentações": 5,
  "Ezequiel": 48, "Daniel": 12, "Oséias": 14, "Joel": 3, "Amós": 9,
  "Obadias": 1, "Jonas": 4, "Miquéias": 7, "Naum": 3, "Habacuque": 3,
  "Sofonias": 3, "Ageu": 2, "Zacarias": 14, "Malaquias": 4, "Mateus": 28,
  "Marcos": 16, "Lucas": 24, "João": 21, "Atos": 28, "Romanos": 16,
  "1 Coríntios": 16, "2 Coríntios": 13, "Gálatas": 6, "Efésios": 6, "Filipenses": 4,
  "Colossenses": 4, "1 Tessalonicenses": 5, "2 Tessalonicenses": 3, "1 Timóteo": 6,
  "2 Timóteo": 4, "Tito": 3, "Filemom": 1, "Hebreus": 13, "Tiago": 5,
  "1 Pedro": 5, "2 Pedro": 3, "1 João": 5, "2 João": 1, "3 João": 1,
  "Judas": 1, "Apocalipse": 22
};

// Lista de versões disponíveis
export const VERSOES_BIBLIA = [
  { nome: 'Nova Versão Int.', sigla: 'nvi' },     
  { nome: 'Almeida Rev. Atualizada', sigla: 'ra' }, 
  { nome: 'Almeida Corr. Fiel', sigla: 'acf' },   
];