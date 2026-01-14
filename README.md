# IPB Calvário - App Mobile ✝️📱

Aplicativo oficial da **Igreja Presbiteriana Calvário**, desenvolvido para conectar os membros, fornecer acesso fácil a recursos espirituais e manter a comunidade informada sobre a agenda da igreja.

Desenvolvido com **React Native**, **Expo** e **Firebase**.

---

## ✨ Funcionalidades

### 👤 Área Pública (Membros)
- **📖 Bíblia Online:** Leitura completa com seletor de versões (NVI, ACF) e livros. Integração com API `abibliadigital`.
- **🎶 Hinário Novo Cântico:** Hinário digital completo.
  - *Pesquisa:* Busca inteligente por número, título ou trecho da letra.
  - *Visualização:* Leitura em tela cheia (Modal) para facilitar o louvor.
- **📅 Agenda & Eventos:** Calendário interativo com os próximos cultos e reuniões.
- **📢 Quadro de Avisos:** Mural digital com notícias e comunicados da liderança.
- **🎂 Aniversariantes:** Lista automática dos aniversariantes do mês corrente.
- **🤲 Dízimos e Ofertas:** Área segura com Chave PIX (cópia rápida), dados bancários e visualização de QR Code.
- **🔗 Redes Sociais:** Acesso rápido ao Instagram, YouTube e WhatsApp da igreja.

### 🛡️ Painel Administrativo (Liderança)
Acesso restrito via autenticação.
- **Gerenciamento de Conteúdo:** CRUD completo (Criar, Ler, Atualizar, Deletar) para:
  - Avisos
  - Eventos/Agenda
  - Aniversariantes
- **Configurações Financeiras:** Edição remota da Chave PIX, Banco, Agência, Conta e URL do QR Code.
- **Ferramentas de Sistema:**
  - **Upload de Hinos:** Script utilitário (`upload_hinos.tsx`) para importação em massa de hinos para o Firestore.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [React Native](https://reactnative.dev/) via [Expo SDK 50+](https://expo.dev/)
- **Linguagem:** TypeScript
- **Navegação:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Banco de Dados:** Firebase Firestore (NoSQL)
- **Deploy & Build:** EAS (Expo Application Services)
- **Estilos:** StyleSheet padrão do React Native
- **Ícones:** Ionicons (@expo/vector-icons)

---

## 🚀 Configuração e Instalação

### Pré-requisitos
- [Node.js](https://nodejs.org/) (LTS)
- Gerenciador de pacotes (`npm` ou `yarn`)
- Conta no [Expo.dev](https://expo.dev) e no [Firebase](https://firebase.google.com/)

### 1. Clonar e Instalar
```bash
git clone [https://github.com/seu-usuario/ipb-calvario.git](https://github.com/seu-usuario/ipb-calvario.git)

cd ipb-calvario

npm install
```

### 2. Configurar Variáveis de Ambiente
O projeto depende do Firebase. Crie um arquivo .env na raiz e preencha com as credenciais do seu projeto Firebase (Web App):

```
EXPO_PUBLIC_FIREBASE_API_KEY="sua_api_key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="seu-id-do-projeto"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="seu_sender_id"
EXPO_PUBLIC_FIREBASE_APP_ID="seu_app_id"
```
Atenção: Para builds na nuvem (EAS), adicione estas mesmas chaves no arquivo eas.json (dentro de env) ou nos Secrets do painel da Expo.

### 3. Rodar Localmente
```
npx expo start
```
Escaneie o QR Code com o app Expo Go (Android/iOS).

---

## 📱 Gerando o APK (Android)
Este projeto utiliza o EAS Build para gerar o binário instalável.

### 1. Login no EAS:

```
npm install -g eas-cli
eas login
```
### 2. **Configurar o Build:** Certifique-se de que o eas.json contém as variáveis de ambiente necessárias.

### 3. Gerar APK (Preview):
```
eas build -p android --profile preview
```
Aguarde o link de download no terminal.

---

## 📂 Estrutura do Projeto
```
/app
  ├── (tabs)          # Telas principais da navegação inferior (Home, Bíblia, Agenda...)
  ├── admin           # Telas de administração (protegidas)
  ├── _layout.tsx     # Layout raiz, Contextos e Configuração de Rotas
  └── upload_hinos.tsx # Utilitário para carga de dados
/components           # Componentes reutilizáveis de UI
/constants            # Dados estáticos (Livros da Bíblia, Cores)
/context              # React Context (AdminContext, etc)
/services             # Configuração do Firebase e Serviços de API
/assets               # Imagens, Ícones e XMLs dos Hinos
```

## 🔧 Scripts Úteis

```
npm start: Inicia o servidor de desenvolvimento.

npm run android: Tenta abrir no emulador Android ou dispositivo conectado.

npm run ios: Tenta abrir no simulador iOS.
```
---

## 📄 Licença
Este software é de propriedade da Igreja Presbiteriana Calvário.
