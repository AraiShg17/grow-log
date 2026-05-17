import OpenAI from 'openai';
import { getOpenAiApiKey, getOpenAiModel } from '@/lib/env';

let client: OpenAI | undefined;

export function getOpenAiClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: getOpenAiApiKey() });
  }
  return client;
}

export function getModel(): string {
  return getOpenAiModel();
}
