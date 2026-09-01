import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
}

/**
 * Gera embedding diretamente pela Gemini API, sem gateway intermediário.
 * O vetor é mantido em 768 dimensões para continuar compatível com o banco existente.
 */
export async function generateEmbedding(input: string): Promise<number[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ausente; a busca semântica usará o fallback textual");
  }

  const model = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
  const res = await fetch(`${GEMINI_API_BASE}/${encodeURIComponent(model)}:embedContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: { parts: [{ text: input }] },
      output_dimensionality: 768,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Embedding falhou (${res.status}): ${txt.slice(0, 500)}`);
  }

  const json = await res.json() as { embedding?: { values?: number[] } };
  const values = json.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Resposta de embedding inválida");
  }
  return values;
}

const CATEGORIAS = [
  "declaracao_anual","das","parcelamento","regularizacao",
  "funcionarios","notas_fiscais","cadastro","pendencias",
  "outros_setores","outros",
] as const;

type Categoria = (typeof CATEGORIAS)[number];

function fallbackIntent(message: string): { categoria: Categoria; titulo_curto: string } {
  const normalized = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const rules: Array<[Categoria, RegExp]> = [
    ["declaracao_anual", /\b(dasn|declaracao|faturamento anual)\b/],
    ["das", /\b(das|boleto|guia|mensalidade|pagamento mensal)\b/],
    ["parcelamento", /\b(parcel|parcelamento|divida)\b/],
    ["regularizacao", /\b(regulariz|inadimpl|irregular|baixar mei|baixa do mei)\b/],
    ["funcionarios", /\b(funcionario|empregado|contrat|folha|salario)\b/],
    ["notas_fiscais", /\b(nota fiscal|nfs|nf-e|nfse|emitir nota)\b/],
    ["cadastro", /\b(cadastro|abrir mei|abertura|cnpj|alterar dados)\b/],
    ["pendencias", /\b(pendencia|debito|restricao|situacao fiscal)\b/],
    ["outros_setores", /\b(alvara|vigilancia|prefeitura|tributos|fazenda)\b/],
  ];
  const categoria = rules.find(([, pattern]) => pattern.test(normalized))?.[0] ?? "outros";
  return { categoria, titulo_curto: message.trim().slice(0, 80) };
}

/** Classifica a intenção. Sem chave de IA, usa um classificador local determinístico. */
export const classifyIntent = createServerFn({ method: "POST" })
  .inputValidator((d: { message: string }) =>
    z.object({ message: z.string().trim().min(1).max(2000) }).parse(d)
  )
  .handler(async ({ data }) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) return fallbackIntent(data.message);

    const model = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash-lite";
    try {
      const res = await fetch(`${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text:
                "Você é um classificador de intenções para a Sala do Empreendedor (MEI). " +
                `Responda somente com JSON. categoria deve ser uma de: ${CATEGORIAS.join(", ")}. ` +
                "titulo_curto deve ter no máximo 80 caracteres.",
            }],
          },
          contents: [{ role: "user", parts: [{ text: data.message }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                categoria: { type: "STRING", enum: [...CATEGORIAS] },
                titulo_curto: { type: "STRING" },
              },
              required: ["categoria", "titulo_curto"],
            },
          },
        }),
      });

      if (!res.ok) return fallbackIntent(data.message);
      const json = await res.json() as any;
      const content = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof content !== "string") return fallbackIntent(data.message);
      const parsed = JSON.parse(content);
      const categoria = (CATEGORIAS as readonly string[]).includes(parsed.categoria)
        ? parsed.categoria as Categoria
        : "outros";
      return {
        categoria,
        titulo_curto: String(parsed.titulo_curto ?? data.message).slice(0, 80),
      };
    } catch (error) {
      console.error("[classifyIntent] IA indisponível; usando fallback local:", error);
      return fallbackIntent(data.message);
    }
  });
