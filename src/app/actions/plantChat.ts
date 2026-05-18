'use server';

import { toActionErrorMessage } from '@/lib/errors/actionError';
import { generatePlantChatReply } from '@/lib/openai/plantChat';
import { toPlantChatMessageDto } from '@/lib/plantChat/serializePlantChatMessage';
import {
  appendPlantChatMessages,
  listPlantChatMessages,
} from '@/lib/firestore/plantChat';
import { getPlant, listPlantLogs } from '@/lib/firestore/plants';
import type { PlantChatMessageDto } from '@/types/plant';

export type ChatActionResult = {
  success: boolean;
  error?: string;
  messages?: PlantChatMessageDto[];
};

const MAX_MESSAGE_LENGTH = 2_000;

export async function sendPlantChatMessageAction(
  plantId: string,
  message: string,
): Promise<ChatActionResult> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { success: false, error: 'メッセージを入力してください。' };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください。`,
    };
  }

  const plant = await getPlant(plantId);
  if (!plant) {
    return { success: false, error: '植物が見つかりません。' };
  }

  try {
    const [logs, history] = await Promise.all([
      listPlantLogs(plantId, 5),
      listPlantChatMessages(plantId, 100),
    ]);

    const assistantContent = await generatePlantChatReply({
      plant,
      logs,
      history,
      userMessage: trimmed,
    });

    const saved = await appendPlantChatMessages(plantId, [
      { role: 'user', content: trimmed },
      { role: 'assistant', content: assistantContent },
    ]);

    return {
      success: true,
      messages: saved.map(toPlantChatMessageDto),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionErrorMessage(error, 'メッセージの送信に失敗しました。'),
    };
  }
}
