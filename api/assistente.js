export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(503).json({
      error: "Variável GROQ_API_KEY não encontrada na Vercel.",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { question, context } = body;
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Pergunta inválida." });
    }

    const systemPrompt = `Você é o Assistente Operacional interno do PontoNexo. Responda em português do Brasil, com clareza e objetividade. Use estas regras do sistema:
- Ponto Digital, catraca biométrica e relógio convencional são modalidades de registro. Na catraca, “Registrar ponto” gera batida de jornada; “Apenas entrada/saída” registra somente acesso.
- Registro remoto pelo Ponto Digital exige autorização de Home Office válida cadastrada pelo RH.
- Ocorrências podem ser incompletas, justificativas ou solicitações de Home Office. O assistente não altera dados, não aprova nem rejeita solicitações; decisões cabem ao RH e gestores.
- A página de Funcionários é restrita ao RH e Gestor. Respeite as permissões e o contexto recebido.
Retorne somente um objeto JSON com estas propriedades: "intent" (título curto), "generalGuidance" (orientação), "userContextInfo" (observação baseada no contexto), "links" (array de objetos com "label" e "page"). O campo page deve ser overview, punch, employees ou occurrences.`;

    const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    let response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Contexto do perfil: ${JSON.stringify(context || {})}\n\nPergunta: ${question.trim()}`,
            },
          ],
          reasoning_effort: "low",
          max_completion_tokens: 512,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const details = (await response.text()).slice(0, 500);
      return res.status(502).json({
        error: `Groq (${response.status}, modelo ${model}): ${details}`,
      });
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content?.trim();
    if (!rawText) {
      return res.status(502).json({ error: `Groq não retornou texto para ${model}.` });
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.intent && parsed.generalGuidance) {
          return res.status(200).json({
            intent: String(parsed.intent),
            generalGuidance: String(parsed.generalGuidance),
            userContextInfo: String(parsed.userContextInfo || `Resposta para o perfil ${context?.resumoPerfil || "atual"}.`),
            links: Array.isArray(parsed.links) ? parsed.links : [],
          });
        }
      } catch {
        // Usa a resposta como texto se o modelo não retornar JSON válido.
      }
    }

    return res.status(200).json({
      intent: "Orientação do Assistente Operacional",
      generalGuidance: rawText.replace(/```json|```/g, "").trim(),
      userContextInfo: `Resposta para o perfil ${context?.resumoPerfil || "atual"}.`,
      links: [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno ao consultar Groq.";
    const isTimeout = error?.name === "AbortError";
    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? "A API Groq excedeu o limite de 20 segundos." : message,
    });
  }
}
