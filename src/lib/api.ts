import axios from "axios";
import type { AssessmentAnswers, PredictionResult } from "./dosha";
import { scoreLocally } from "./dosha";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

/**
 * Wake Railway from cold sleep by polling the health endpoint.
 * Retries up to `maxRetries` times with increasing delays.
 * Returns true when the backend is confirmed alive.
 */
async function wakeBackend(maxRetries = 3): Promise<boolean> {
  if (!API_URL) return false;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(`${API_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return true;
      // 502/503 = Railway proxy responding while container boots — keep retrying
    } catch {
      // Network error or timeout — container is still spinning up
    }
    // Wait before retrying (1s, 2s, 3s)
    if (attempt < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }
  return false;
}

export async function predictDosha(answers: AssessmentAnswers): Promise<{
  result: PredictionResult;
  source: "api" | "local";
  error?: string;
}> {
  if (!API_URL) {
    return { result: scoreLocally(answers), source: "local", error: "VITE_API_URL not set" };
  }

  // Wake the backend — only attempt predict if it responds
  const alive = await wakeBackend();
  if (!alive) {
    return {
      result: scoreLocally(answers),
      source: "local",
      error: "Backend did not respond after retries",
    };
  }

  try {
    const { data } = await axios.post<PredictionResult>(`${API_URL}/predict`, answers, {
      timeout: 15_000,
      headers: { "Content-Type": "application/json" },
    });
    return { result: data, source: "api" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return { result: scoreLocally(answers), source: "local", error: message };
  }
}

export async function checkHealth(): Promise<{ ok: boolean; modelLoaded?: boolean }> {
  if (!API_URL) return { ok: false };
  try {
    const { data } = await axios.get(`${API_URL}/health`, { timeout: 5_000 });
    return { ok: data.status === "ok", modelLoaded: data.model_loaded };
  } catch {
    return { ok: false };
  }
}
