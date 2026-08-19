// api/generate-carrossel.js
// Backend (serverless function) que recebe a chamada do HTML do carrossel
// e repassa para a API da Anthropic, usando a chave guardada em variável
// de ambiente (nunca exposta no navegador).
//
// Pronta pra rodar na Vercel: basta colocar este arquivo dentro de uma
// pasta chamada "api" na raiz do projeto e fazer o deploy.

export default async function handler(req, res) {
  // Libera chamadas vindas do navegador (ajuste o domínio se quiser travar mais)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no servidor' });
    return;
  }

  try {
    const { model, max_tokens, system, messages } = req.body || {};

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 4000,
        system,
        messages
      })
    });

    const data = await anthropicResponse.json();
    res.status(anthropicResponse.status).json(data);
  } catch (err) {
    console.error('Erro ao chamar a API da Anthropic:', err);
    res.status(500).json({ error: 'Erro ao chamar a API da Anthropic' });
  }
}
