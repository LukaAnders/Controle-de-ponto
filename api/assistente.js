export const config = { maxDuration: 60 };

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
      error: "Variável GEMINI_API_KEY não encontrada no servidor da Vercel.",
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
Se o usuário fizer qualquer saudação ou pergunta aberta (como "Olá", "Gemini?", "Quem é você?", "Está funcionando?"), responda cordialmente confirmando que você é o Assistente Operacional do PontoNexo (conectado ao Google Gemini) e explique como pode ajudar na rotina de ponto com base nos dados atuais do perfil dele.

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

Retorne APENAS um objeto JSON válido com exatamente estas propriedades:
{
  "intent": "título curto e direto da orientação",
  "generalGuidance": "explicação clara da resposta no PontoNexo. Se houver passos, enumere como (1) ..., (2) ..., (3) ...",
  "userContextInfo": "observação personalizada com base no perfil atual do usuário e nos dados do contexto enviado",
  "links": [
    { "label": "Abrir Central de Ponto", "page": "punch" }
  ]
}
(Nota: em "links", o campo "page" deve ser apenas um destes: "overview", "punch", "employees" ou "occurrences").`;

    const tryGenerate = async (model) => {
      const generationConfig = {
        maxOutputTokens: 256,
      };

      // Gemini 3 uses thinkingLevel; use a low reasoning level for latency.
      if (/^gemini-3\.(5|6|7|8)-flash/.test(model)) {
        generationConfig.thinkingConfig = {
          thinkingLevel: model.startsWith("gemini-3.8-") || model.startsWith("gemini-3.7-") ? "low" : "minimal",
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      let response;
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
          }),
            signal: controller.signal,
          },
        );
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errTxt = await response.text();
        return { ok: false, error: `${model} (${response.status}): ${errTxt.slice(0, 120)}` };
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const rawText = parts
        .map((p) => p.text || "")
        .join("\n")
        .trim();

      if (!rawText) {
        return { ok: false, error: `${model}: resposta vazia` };
      }

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.intent && parsed.generalGuidance) {
            return { ok: true, data: parsed };
          }
        } catch {
          // Usa fallback de texto corrido abaixo
        }
      }

      return {
        ok: true,
        data: {
          intent: "Orientação do Assistente Operacional",
          generalGuidance: rawText.replace(/```json|```/g, "").trim(),
          userContextInfo: `Resposta gerada para o perfil ${context?.resumoPerfil || "atual"}.`,
          links: [
            { label: "Abrir Central de Ponto", page: "punch" },
            { label: "Ver Ocorrências e Justificativas", page: "occurrences" },
          ],
        },
      };
    };

    // 1. Tenta direto os modelos mais rápidos (sem gastar tempo listando antes)
    const configuredModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const fastCandidates = [
      { model: configuredModel },
      ...(configuredModel === "gemini-3.8-flash"
        ? []
        : [{ model: "gemini-3.8-flash" }]),
    ];

    const errors = [];

    for (const item of fastCandidates) {
      try {
        const result = await tryGenerate(item.model);
        if (result.ok) {
          return res.status(200).json(result.data);
        }
        errors.push(result.error);
      } catch (e) {
        errors.push(
          `${item.model}: ${e instanceof Error ? e.message : "erro"}${
            e?.name === "AbortError" ? " (timeout ao aguardar o Gemini)" : ""
          }`,
        );
      }
    }

    return res.status(502).json({
      error: `Não foi possível gerar resposta (${errors.join(" | ")})`,
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Erro interno ao consultar IA",
    });
  }
}
