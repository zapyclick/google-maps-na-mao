const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const { prompt } = JSON.parse(event.body);

  const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Usando o modelo Llama 3 de 8 bilhões de parâmetros
        messages: [
          { "role": "user", "content": prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Erro da API Groq: ${response.statusText}`, details: errorBody })
      };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ content: content })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Erro interno da função: ${error.message}` })
    };
  }
};