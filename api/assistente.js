export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  ).trim();

  if (!apiKey) {
    return res.status(503).json({
      error:
        "Variável GEMINI_API_KEY não encontrada no servidor da Vercel. Verifique em Settings > Environment Variables se o nome está como GEMINI_API_KEY e faça um Redeploy.",
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
    const { question, context } = body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Pergunta inválida." });
    }

    const prompt = `Você é o Assistente Operacional interno do sistema PontoNexo (sistema de controle de ponto e gestão de jornada).
Sua função é responder dúvidas operacionais de forma clara, objetiva, administrativa e em português (pt-BR).
Mesmo se o usuário fizer uma saudação ou pergunta aberta (como "Olá", "Gemini?", "Quem é você?", "Está funcionando?"), responda cordialmente confirmando que o Assistente Operacional integrado ao Gemini está ativo e explicando como pode ajudar com base nos dados atuais do perfil dele.

Regras do sistema PontoNexo:
1. Modalidades de ponto na Central de Ponto (página "punch"):
   - Modalidade 1 (Ponto Digital): web/app com verificação facial simulada. Para registrar em Home Office, exige autorização remota ativa cadastrada pelo RH com data de validade vigente.
   - Modalidade 2 (Catraca Biométrica): possui 2 opções distintas: (1) "Registrar ponto (Jornada + Acesso)" e (2) "Apenas entrada/saída (Somente Acesso)", que registra só circulação física sem gerar batida de ponto.
   - Modalidade 3 (Relógio Convencional - REP): marcação rápida por matrícula.
2. Ocorrências e Justificativas (página "occurrences"):
   - Tipos: "incompleto" (Registro de ponto incompleto), "justificativa" (Justificativa de jornada/ausência/atraso), "homeoffice" (Autorização de home office).
   - Estados: Pendente, Em análise, Encaminhada para revisão, Aprovada, Rejeitada.
   - O assistente NUNCA aprova nem rejeita justificativas nem altera dados; a deliberação é exclusiva do RH e gestores.
3. Funcionários e Escalas (página "employees"):
   - Visível apenas para RH e Gestor (vedado ao perfil Funcionário). Permite ao RH cadastrar funcionários e gerenciar validade da permissão de Home Office.
4. Visão Operacional (página "overview"):
   - Painel administrativo com resumo do dia, situação nominal dos funcionários e pendências do RH.

Contexto atual do usuário logado na sessão:
${JSON.stringify(context || {}, null, 2)}

Pergunta do usuário: "${question}"

Retorne APENAS um objeto JSON válido (sem blocos markdown \`\`\`json) com exatamente estas propriedades:
{
  "intent": "título curto e direto da orientação",
  "generalGuidance": "explicação clara da resposta no PontoNexo. Se houver passos, enumere como (1) ..., (2) ..., (3) ...",
  "userContextInfo": "observação personalizada com base no perfil atual do usuário e nos dados do contexto enviado",
  "links": [
    { "label": "texto curto do botão", "page": "punch" }
  ]
}
(Nota: em "links", o campo "page" deve ser apenas um destes: "overview", "punch", "employees" ou "occurrences").`;

    const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
    let lastError = "";

    for (const model of models) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        lastError = `${model} (${response.status}): ${await response.text()}`;
        continue;
      }

      const data = await response.json();
      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleanJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      const parsed = JSON.parse(cleanJson);
      return res.status(200).json(parsed);
    }

    return res.status(502).json({
      error: `Falha na API Gemini: ${lastError}`,
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Erro interno ao consultar IA",
    });
  }
}
