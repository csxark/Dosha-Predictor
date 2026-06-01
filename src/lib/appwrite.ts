import { Client, Databases, ID } from "appwrite";
import type { AssessmentAnswers } from "./dosha";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT as string)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID as string);

const databases = new Databases(client);

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID as string;

export interface AssessmentDocument {
  assessmentId: string;
  predictedDosha: string;
  confidence: number;
  secondaryDosha: string;
  answers: string; // JSON-stringified AssessmentAnswers
  timestamp: string;
}

/**
 * Save a completed assessment to Appwrite.
 * Returns the created document $id for shareable links.
 */
export async function saveAssessment(payload: {
  predictedDosha: string;
  confidence: number;
  secondaryDosha: string;
  answers: AssessmentAnswers;
}): Promise<string> {
  const docId = ID.unique();
  const assessmentId = ID.unique();

  await databases.createDocument(DATABASE_ID, COLLECTION_ID, docId, {
    assessmentId,
    predictedDosha: payload.predictedDosha,
    confidence: payload.confidence,
    secondaryDosha: payload.secondaryDosha,
    answers: JSON.stringify(payload.answers),
    timestamp: new Date().toISOString(),
  } satisfies AssessmentDocument);

  return docId;
}

/**
 * Load a previously saved assessment by its Appwrite document $id.
 */
export async function getAssessment(documentId: string): Promise<AssessmentDocument | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, documentId);
    return doc as unknown as AssessmentDocument;
  } catch {
    return null;
  }
}
