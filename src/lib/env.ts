function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function getGcpProjectId(): string {
  return requireEnv('GCP_PROJECT_ID');
}

export function getFirestoreDatabaseId(): string {
  return requireEnv('FIRESTORE_DATABASE_ID');
}

export function getGcsBucketName(): string {
  return requireEnv('GCS_BUCKET_NAME');
}

export function getOpenAiApiKey(): string {
  const value = process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_API_KEY;
  if (!value) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return value;
}

export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL ?? 'gpt-5.4-mini';
}
