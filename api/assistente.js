export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "GEMINI_API_KEY não configurada nas variáveis de ambiente da Vercel.",
    });
  }

  try {
    const { question, context } = req.body || {};
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Pergunta inválida." });
    }

    const systemInstruction = `Você é o Assistente Operacional interno do sistema PontoNexo (sistema de controle de ponto e gestão de jornada).
Sua função é responder dúvidas operacionais de forma clara, objetiva, administrativa e em português (pt-BR).

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

Retorne SEMPRE um objeto JSON válido com exatamente estas propriedades:
- "intent": título curto e direto da orientação (ex.: "Procedimento para envio de justificativa").
- "generalGuidance": explicação clara do procedimento no PontoNexo. Se houver passos ou modalidades, enumere-os como (1) ..., (2) ..., (3) ... para facilitar a leitura.
- "userContextInfo": observação personalizada com base no perfil atual do usuário e nos números/dados do contexto enviado.
- "links": array de 1 a 2 atalhos relevantes do sistema, onde cada item tem:
  - "label": texto curto do botão (ex.: "Abrir Central de Ponto", "Consultar Ocorrências e Justificativas", "Gerenciar Funcionários")
  - "page": uma das páginas permitidas ao perfil ("overview", "punch", "employees", "occurrences")
  - "query" (opcional): objeto com filtros opcionais, ex. { "open": "1" } ou { "type": "homeoffice" } ou { "type": "incompleto", "open": "1" }.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: question }],
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
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(rawText);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Erro interno ao consultar IA",
    });
  }
}
