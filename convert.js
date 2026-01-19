const fs = require('fs');

// Caminho do seu JSON original
const json = require('./constants/nvi.json'); 

// Cria o conteúdo do arquivo TS
const conteudoTS = `export const BIBLIA_NVI = ${JSON.stringify(json)};`;

// Salva na pasta constants
fs.writeFileSync('./constants/biblia_nvi.ts', conteudoTS);

console.log('Convertido com sucesso!');