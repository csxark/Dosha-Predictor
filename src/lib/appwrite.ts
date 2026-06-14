import { Client, Databases, ID, Account } from "appwrite";
import type { AssessmentAnswers } from "./dosha";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT as string)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID as string);

const account = new Account(client);
const databases = new Databases(client);

// Create anonymous session on first load
try {
  await account.createAnonymousSession();
} catch {
  // Session might already exist
}

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID as string;

export interface AssessmentDocument {
  assessmentId: string;
  predictedDosha: string;
  confidence: number;
  secondaryDosha: string;
  answers: string;
  timestamp: string;
}

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

export async function getAssessment(documentId: string): Promise<AssessmentDocument | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, documentId);
    return doc as unknown as AssessmentDocument;
  } catch {
    return null;
  }
}
