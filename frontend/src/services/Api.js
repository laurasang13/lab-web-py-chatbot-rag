/**
 * Api.js — MindVibes
 * Sustituye la llamada directa a Gemini por el backend RAG propio.
 * El backend (api.py) debe estar corriendo en localhost:8000.
 */

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || "http://localhost:8000";

/**
 * Llama al backend RAG y devuelve el objeto con recomendaciones y frase,
 * en el mismo formato que esperaba la llamada a Gemini, para no
 * romper el resto del código (useFetch, MoodDetailPage, etc.)
 *
 * @param {string} mood - Nombre del mood (ej: "Sadness", "Anger")
 * @returns {Promise<{recommendations: string[], phrase: string, fuentes: string[]} | null>}
 */
export async function analyzeMood(mood) {
  console.log("analyzeMood (RAG) called with:", mood);

  // Genera un session_id por pestaña del navegador para mantener historial
  const sessionId = getOrCreateSessionId();

  const pregunta = `I'm feeling ${mood}. Based on your documents, what do you recommend for managing this emotional state? Please provide 3 practical recommendations and a short encouraging phrase.`;

  try {
    const response = await fetch(`${RAG_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pregunta,
        session_id: sessionId,
      }),
    });

    console.log("RAG API response status:", response.status);

    if (response.status === 429) {
      throw new Error("Too many requests. Please wait a moment before trying again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error contacting the RAG backend");
    }

    const data = await response.json();
    console.log("RAG API response:", data);

    if (data.advertencia_privacidad) {
      console.warn("⚠️ La pregunta puede contener información personal.");
    }

    // Parsea la respuesta del LLM en el formato que espera el frontend
    const parsed = parseRagResponse(data.respuesta);

    return {
      ...parsed,
      fuentes: data.fuentes,
      session_id: data.session_id,
    };

  } catch (error) {
    console.error("Error en analyzeMood (RAG):", error.message);
    return null; // Activa el fallback en useFetch
  }
}


/**
 * Intenta extraer recommendations[] y phrase del texto libre del LLM.
 * Si no puede, devuelve la respuesta completa como un único "recommendation".
 */
function parseRagResponse(text) {
  if (!text) return null;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const recommendations = [];
  let phrase = "";

  // Detecta líneas que parecen recomendaciones (numeradas o con guión/bullet)
  const recPattern = /^(\d+[\.\)]\s|-\s|•\s|\*\s)/;
  // Detecta frases cortas al final que parezcan una frase motivacional
  const phrasePattern = /["'"«](.+)["'"»]|^(Recuerda|Remember|You|Tú|💪|✨|🌟)/i;

  for (const line of lines) {
    if (recPattern.test(line)) {
      recommendations.push(line.replace(recPattern, "").trim());
    } else if (phrasePattern.test(line) && !phrase) {
      phrase = line.replace(/^["'"«]|["'"»]$/g, "").trim();
    }
  }

  // Fallback: si no detectó estructura, usa las primeras líneas como recomendaciones
  if (recommendations.length === 0) {
    const nonEmpty = lines.filter((l) => l.length > 20);
    recommendations.push(...nonEmpty.slice(0, 3));
    phrase = nonEmpty.length > 3 ? nonEmpty[nonEmpty.length - 1] : "";
  }

  return {
    recommendations: recommendations.slice(0, 3),
    phrase: phrase || "You're taking a great step by checking in with yourself.",
  };
}


/**
 * Genera o recupera un session_id único por pestaña del navegador.
 * Usa sessionStorage para que sea por sesión, no permanente.
 */
function getOrCreateSessionId() {
  const key = "mindvibes_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}
