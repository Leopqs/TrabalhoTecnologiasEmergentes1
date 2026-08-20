<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

  O projeto escolhido foi o nosso da escola de TI que envolve fazer uma aplicação de gerenciamento de alunos, mas com o bônus de ter um escalonador de horários automático, porém nesse trabalho foi explorado somente as funcionalidades do professor como realizar a chamada, visualizar o horário de aula, responder o formulário de disponibilidade entre outras.

  Como esse repositório representa o resultado que a IA daria sem  muita informação de contexto, optamos por não definir um system prompt, não utilizar técnicas de prompt para melhorar o resultado e nem anexar arquivos para contexto. Apenas o prompt cru com a quantidade de token gastas.
  

  prompt simples enviado

  <img width="600" height="600" alt="Prompt1Enviado" src="https://github.com/Leopqs/TrabalhoTecnologiasEmergentes1/blob/main/Prompt1Enviado.jpg" />


  resposta do prompt simples

  <img width="600" height="600" alt="Prompt1Resposta" src="https://github.com/Leopqs/TrabalhoTecnologiasEmergentes1/blob/main/Prompt1Resposta.jpeg" />


  Quantidade de tokens de entrada e saída gastas e seu custo: [CUSTOS_GEMINI](https://github.com/Leopqs/TrabalhoTecnologiasEmergentes1/blob/main/CUSTOS_GEMINI.md)


  link de publicação do projeto: https://portalprofessor06082005.ai.studio


  Integrantes:
  
  Vinicius Zamora - 23003800-2
  
  Leonardo Enz - 23011726-2
  
  Bruno Novodovoski - 23175971-2

  
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6145e215-b9ae-449f-aa65-98ed08aac903

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
